"""
QuizBank MongoDB → SQLite 转换脚本

将 /mnt/disk3/QuizBank.tar.gz 解压后的 BSON 文件导入 SQLite 数据库。
- 仅导入题库核心集合: quiz (含 a1/a2/a3/xes/B 等全部题型)
- 不导入 embedding 向量、tag、set 等辅助集合

用法:
    python processor/mongo_to_sqlite.py
    python processor/mongo_to_sqlite.py --bson-dir /tmp/quizbank_extract/QuizBank
    python processor/mongo_to_sqlite.py --db /path/to/output.db
    python processor/mongo_to_sqlite.py --overwrite   # 覆盖已有数据库
"""

import sqlite3
import json
import hashlib
import argparse
import sys
import tarfile
from pathlib import Path
from datetime import datetime

import bson

# ─── 路径常量 ───────────────────────────────────────────────
DEFAULT_TAR = Path("/mnt/disk3/QuizBank.tar.gz")
DEFAULT_EXTRACT_DIR = Path("/tmp/quizbank_extract")
DEFAULT_BSON_DIR = DEFAULT_EXTRACT_DIR / "QuizBank"
DEFAULT_DB = Path("/mnt/disk3/ykb_copyer/quizbank.db")

# ─── Schema 设计 ───────────────────────────────────────────

SCHEMA_SQL = """
-- 科目维度表
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    question_count INTEGER DEFAULT 0
);

-- 章节维度表
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    name TEXT NOT NULL,
    UNIQUE(subject_id, name)
);

-- 题目主表
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mongo_id TEXT UNIQUE NOT NULL,           -- MongoDB ObjectId 字符串（溯源用）
    type TEXT NOT NULL,                       -- A1 / A2 / A3 / X / B
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    unit_id INTEGER REFERENCES units(id),     -- A3 题型可能无 unit
    source TEXT,                              -- 西综真题 / 临床职业医师等
    extracted_year INTEGER,
    stem TEXT NOT NULL,                       -- 题干（A3 时存 mainQuestion）
    answer TEXT NOT NULL,                     -- 答案：A1/A2/B: 单字母；X: 拼接如 "BCD"
    point TEXT DEFAULT '',                    -- 解析-知识点
    discuss TEXT DEFAULT '',                  -- 解析-讨论
    link_ids TEXT DEFAULT '[]',               -- analysis.link 的 ObjectId 列表（JSON）
    processed_at TEXT,                        -- ISO 8601 时间
    content_hash TEXT UNIQUE NOT NULL         -- 去重哈希
);

-- 题目选项表
CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label TEXT NOT NULL,                      -- A / B / C / D / E
    content TEXT NOT NULL,                    -- 选项文本（去掉前缀字母）
    sort_order INTEGER NOT NULL
);

-- A3 子题表（A3 病例串题共用同一题干，子题独立选项和答案）
CREATE TABLE IF NOT EXISTS sub_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sub_quiz_id INTEGER NOT NULL,             -- 子题序号（0,1,2...）
    mongo_id TEXT,                            -- 子题 ObjectId
    stem TEXT NOT NULL,                       -- 子题题干
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    UNIQUE(question_id, sub_quiz_id)
);

-- 子题选项表
CREATE TABLE IF NOT EXISTS sub_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_question_id INTEGER NOT NULL REFERENCES sub_questions(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_unit ON questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(extracted_year);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_subq_question ON sub_questions(question_id);

-- FTS5 全文搜索
CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts USING fts5(
    stem,
    point,
    discuss,
    content='questions',
    content_rowid='id'
);
"""


# ─── 工具函数 ───────────────────────────────────────────────

def parse_option(opt: object) -> tuple[str, str]:
    """解析选项 {oid, text} → (label, content)。

    文本可能以 "A." 开头（"A.选项内容"），剥离前缀避免重复。
    """
    if not isinstance(opt, dict):
        return "", str(opt)
    label = str(opt.get("oid", "")).strip()
    content = str(opt.get("text", "")).strip()
    # 去除前缀字母（如 "A.选项内容" → "选项内容"）
    if content and label and content.startswith(label + "."):
        content = content[len(label) + 1:].strip()
    return label, content


def normalize_answer(answer) -> str:
    """标准化答案字段。

    - "B"               → "B"
    - ["B","C","D"]     → "BCD"
    - 数字 / None       → ""
    """
    if answer is None:
        return ""
    if isinstance(answer, str):
        return answer.strip()
    if isinstance(answer, list):
        return "".join(str(a).strip() for a in answer)
    return str(answer)


def compute_hash(*parts: str) -> str:
    """对多个字符串拼接后计算 SHA256。"""
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode("utf-8"))
        h.update(b"\x00")
    return h.hexdigest()


def iso(dt) -> str | None:
    """BSON datetime → ISO 8601 字符串。"""
    if dt is None:
        return None
    if isinstance(dt, datetime):
        return dt.isoformat()
    return str(dt)


# ─── 数据导入 ───────────────────────────────────────────────

def create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_SQL)
    conn.commit()


def get_or_create_subject(conn: sqlite3.Connection, name: str) -> int:
    name = (name or "").strip()
    if not name:
        name = "未分类"
    cur = conn.execute("SELECT id FROM subjects WHERE name = ?", (name,))
    row = cur.fetchone()
    if row is not None:
        return int(row[0])
    cur = conn.execute("INSERT INTO subjects (name) VALUES (?)", (name,))
    conn.commit()
    assert cur.lastrowid is not None
    return int(cur.lastrowid)


def get_or_create_unit(conn: sqlite3.Connection, subject_id: int, name: str) -> int | None:
    name = (name or "").strip()
    if not name:
        return None
    cur = conn.execute(
        "SELECT id FROM units WHERE subject_id = ? AND name = ?",
        (subject_id, name),
    )
    row = cur.fetchone()
    if row is not None:
        return int(row[0])
    cur = conn.execute(
        "INSERT INTO units (subject_id, name) VALUES (?, ?)",
        (subject_id, name),
    )
    conn.commit()
    assert cur.lastrowid is not None
    return int(cur.lastrowid)


def import_quiz_doc(conn: sqlite3.Connection, doc: dict, stats: dict) -> bool:
    """导入单条 quiz 文档。"""
    try:
        q_type = (doc.get("type") or "").strip()
        subject_name = (doc.get("class") or "").strip()
        unit_name = (doc.get("unit") or "").strip()

        # 题干：A3 用 mainQuestion，其它用 question
        is_a3 = q_type == "A3"
        stem = (doc.get("mainQuestion") if is_a3 else doc.get("question")) or ""
        stem = stem.strip()
        if not stem:
            stats["errors"] += 1
            return False

        answer = normalize_answer(doc.get("answer"))

        analysis = doc.get("analysis") or {}
        point = (analysis.get("point") or "").strip()
        discuss = (analysis.get("discuss") or "").strip()
        link_ids = [str(x) for x in (analysis.get("link") or [])]
        link_ids_json = json.dumps(link_ids, ensure_ascii=False)

        mongo_id = str(doc["_id"])
        source = (doc.get("source") or "").strip() or None
        extracted_year = doc.get("extractedYear")
        processed_at = iso(doc.get("processedAt"))

        # 维度
        subject_id = get_or_create_subject(conn, subject_name)
        unit_id = get_or_create_unit(conn, subject_id, unit_name) if unit_name else None

        # 去重：使用 type+stem+answer 组合
        content_hash = compute_hash(q_type, stem, answer)

        cur = conn.execute(
            """
            INSERT OR IGNORE INTO questions
                (mongo_id, type, subject_id, unit_id, source, extracted_year,
                 stem, answer, point, discuss, link_ids, processed_at, content_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                mongo_id, q_type, subject_id, unit_id, source, extracted_year,
                stem, answer, point, discuss, link_ids_json, processed_at,
                content_hash,
            ),
        )

        if cur.rowcount == 0:
            stats["skipped"] += 1
            return False

        assert cur.lastrowid is not None
        question_id = int(cur.lastrowid)

        # 插入选项（A3 题目本身没有顶层 options，选项挂在 sub_questions 上）
        if not is_a3:
            options = doc.get("options") or []
            for idx, opt in enumerate(options):
                label, content = parse_option(opt)
                if not label:
                    continue
                conn.execute(
                    """
                    INSERT INTO options (question_id, label, content, sort_order)
                    VALUES (?, ?, ?, ?)
                    """,
                    (question_id, label, content, idx),
                )
        else:
            # A3: 处理嵌套的 subQuizs
            for idx, sub in enumerate(doc.get("subQuizs") or []):
                if not isinstance(sub, dict):
                    continue
                sub_stem = (sub.get("question") or "").strip()
                if not sub_stem:
                    continue
                sub_answer = normalize_answer(sub.get("answer"))
                sub_mongo_id = str(sub.get("_id", ""))
                sub_quiz_id = sub.get("subQuizId", idx)

                cur2 = conn.execute(
                    """
                    INSERT INTO sub_questions
                        (question_id, sub_quiz_id, mongo_id, stem, answer, sort_order)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (question_id, sub_quiz_id, sub_mongo_id, sub_stem, sub_answer, idx),
                )
                assert cur2.lastrowid is not None
                sub_id = int(cur2.lastrowid)

                # 子题选项
                for o_idx, opt in enumerate(sub.get("options") or []):
                    label, content = parse_option(opt)
                    if not label:
                        continue
                    conn.execute(
                        """
                        INSERT INTO sub_options (sub_question_id, label, content, sort_order)
                        VALUES (?, ?, ?, ?)
                        """,
                        (sub_id, label, content, o_idx),
                    )

        stats["inserted"] += 1
        return True

    except Exception as e:
        stats["errors"] += 1
        stats["error_samples"].append(str(e)[:200])
        return False


def update_subject_counts(conn: sqlite3.Connection) -> None:
    conn.execute("""
        UPDATE subjects SET question_count = (
            SELECT COUNT(*) FROM questions WHERE questions.subject_id = subjects.id
        )
    """)
    conn.commit()


def build_fts(conn: sqlite3.Connection) -> None:
    conn.execute("INSERT INTO questions_fts(questions_fts) VALUES('rebuild')")
    conn.commit()


def print_summary(conn: sqlite3.Connection, stats: dict) -> None:
    print("\n" + "=" * 60)
    print("  QuizBank 导入统计摘要")
    print("=" * 60)

    tables = {
        "questions": "题目",
        "options": "选项",
        "sub_questions": "A3 子题",
        "sub_options": "子题选项",
        "subjects": "科目",
        "units": "章节",
    }
    for t, label in tables.items():
        n = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"  {label:<8} ({t}): {n:>6} 条")

    print(f"\n  文件处理: {stats['total']}")
    print(f"  插入题目: {stats['inserted']}")
    print(f"  跳过重复: {stats['skipped']}")
    print(f"  错误:     {stats['errors']}")
    if stats["error_samples"]:
        print(f"\n  前 3 条错误样本:")
        for s in stats["error_samples"][:3]:
            print(f"    - {s}")

    print(f"\n  题型分布:")
    for row in conn.execute(
        "SELECT type, COUNT(*) FROM questions GROUP BY type ORDER BY COUNT(*) DESC"
    ):
        print(f"    {row[0]:<6} {row[1]:>6} 题")

    print(f"\n  科目 Top 10:")
    for row in conn.execute(
        "SELECT name, question_count FROM subjects ORDER BY question_count DESC LIMIT 10"
    ):
        print(f"    {row[0]:<20} {row[1]:>6} 题")

    print(f"\n  年份分布 (Top 10):")
    for row in conn.execute(
        "SELECT extracted_year, COUNT(*) FROM questions "
        "WHERE extracted_year IS NOT NULL "
        "GROUP BY extracted_year ORDER BY extracted_year DESC LIMIT 10"
    ):
        print(f"    {row[0]:<6} {row[1]:>6} 题")

    print("=" * 60)


# ─── 主入口 ─────────────────────────────────────────────────

def extract_tar(tar_path: Path, extract_dir: Path) -> Path:
    """解压 tar.gz 到指定目录，返回 BSON 集合目录。"""
    print(f"[*] 解压 {tar_path} → {extract_dir}")
    extract_dir.mkdir(parents=True, exist_ok=True)
    with tarfile.open(tar_path, "r:gz") as tf:
        tf.extractall(extract_dir)
    bson_dir = extract_dir / "QuizBank"
    print(f"[√] 解压完成: {bson_dir}")
    return bson_dir


def load_bson(bson_path: Path):
    """流式读取 BSON 文件，返回文档列表。"""
    if not bson_path.exists() or bson_path.stat().st_size == 0:
        return []
    with open(bson_path, "rb") as f:
        return list(bson.decode_file_iter(f))


def main():
    parser = argparse.ArgumentParser(
        description="将 QuizBank MongoDB BSON 数据转换为 SQLite 数据库"
    )
    parser.add_argument(
        "--tar", type=str, default=str(DEFAULT_TAR),
        help=f"MongoDB 导出 tar.gz 路径（默认: {DEFAULT_TAR}）",
    )
    parser.add_argument(
        "--bson-dir", type=str, default=None,
        help="已解压的 BSON 目录（跳过解压步骤）",
    )
    parser.add_argument(
        "--db", type=str, default=str(DEFAULT_DB),
        help=f"输出 SQLite 数据库路径（默认: {DEFAULT_DB}）",
    )
    parser.add_argument(
        "--overwrite", action="store_true",
        help="覆盖已有数据库",
    )
    parser.add_argument(
        "--skip-fts", action="store_true",
        help="跳过 FTS5 索引构建",
    )
    parser.add_argument(
        "--vacuum", action="store_true",
        help="导入完成后 VACUUM 压缩",
    )
    args = parser.parse_args()

    db_path = Path(args.db)

    # 检查数据库
    if db_path.exists() and not args.overwrite:
        print(f"[!] 数据库已存在: {db_path}")
        print(f"    使用 --overwrite 参数覆盖")
        sys.exit(1)

    # 确定 BSON 目录
    if args.bson_dir:
        bson_dir = Path(args.bson_dir)
        print(f"[*] 使用已解压的 BSON 目录: {bson_dir}")
    else:
        bson_dir = extract_tar(Path(args.tar), DEFAULT_EXTRACT_DIR)

    if not bson_dir.is_dir():
        print(f"[!] BSON 目录不存在: {bson_dir}")
        sys.exit(1)

    # 删除旧库
    if db_path.exists():
        db_path.unlink()
    for suffix in ("-wal", "-shm", "-journal"):
        p = db_path.with_suffix(db_path.suffix + suffix)
        if p.exists():
            p.unlink()
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # 连接数据库
    print(f"\n[*] 创建数据库: {db_path}")
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA foreign_keys=ON")

    create_schema(conn)

    # 加载 quiz 集合（包含全部题型的题目）
    quiz_path = bson_dir / "quiz.bson"
    print(f"\n[*] 加载 {quiz_path}")
    docs = load_bson(quiz_path)
    total = len(docs)
    print(f"[√] 已加载 {total} 个文档")

    # 统计
    stats = {
        "total": 0,
        "inserted": 0,
        "skipped": 0,
        "errors": 0,
        "error_samples": [],
    }

    # 批量导入
    batch_size = 1000
    print(f"\n[*] 开始导入...")
    for i, doc in enumerate(docs, 1):
        stats["total"] += 1
        import_quiz_doc(conn, doc, stats)

        if i % batch_size == 0:
            conn.commit()
            print(
                f"  [{i}/{total}] "
                f"已处理 {stats['total']} | 插入 {stats['inserted']} | "
                f"跳过 {stats['skipped']} | 错误 {stats['errors']}"
            )

    conn.commit()

    # 更新科目计数
    update_subject_counts(conn)

    # 构建 FTS
    if not args.skip_fts:
        print("\n[*] 构建 FTS5 索引...")
        build_fts(conn)
        n = conn.execute("SELECT COUNT(*) FROM questions_fts").fetchone()[0]
        print(f"[√] FTS5 索引: {n} 条")

    # VACUUM
    if args.vacuum:
        print("\n[*] 执行 VACUUM...")
        conn.execute("VACUUM")
        print("[√] 完成")

    # 摘要
    print_summary(conn, stats)

    # 大小
    db_size = db_path.stat().st_size
    if db_size > 1024 * 1024:
        print(f"\n  数据库大小: {db_size / 1024 / 1024:.1f} MB")
    else:
        print(f"\n  数据库大小: {db_size / 1024:.1f} KB")

    conn.close()
    print("\n[√] 转换完成！")


if __name__ == "__main__":
    main()
