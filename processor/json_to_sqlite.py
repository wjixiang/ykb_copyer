"""
题库 JSON → SQLite 转换脚本

将 tests_json_vault/ 和 undefined/ 中的 JSON 题库文件导入 SQLite 数据库，
在导入过程中完成数据清洗（mode 标准化、answer 格式统一、cls 空格清理）和去重。

用法:
    python processor/json_to_sqlite.py
    python processor/json_to_sqlite.py --db /path/to/output.db
    python processor/json_to_sqlite.py --skip-fts          # 跳过 FTS5 索引构建
    python processor/json_to_sqlite.py --vacuum             # 导入后执行 VACUUM 压缩
"""

import sqlite3
import json
import hashlib
import re
import argparse
import sys
from pathlib import Path

# ─── 路径常量 ───────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
VAULT_DIR = PROJECT_ROOT / "tests_json_vault"
UNDEFINED_DIR = PROJECT_ROOT / "undefined"
DEFAULT_DB = PROJECT_ROOT / "ykb_questions.db"

# ─── Mode 标准化映射 ───────────────────────────────────────
MODE_MAP = {
    "A1型题": "A1",
    "单选题": "A1",
    "A1": "A1",
    "A2型题": "A2",
    "A2": "A2",
    "A3型题": "A3",
    "A4型题": "A4",
    "A3/A4型题": "A3",
    "B型题": "B",
    "B": "B",
    "X型题": "X",
    "多选题": "X",
    "X": "X",
    "C型题": "C",
    "C": "C",
}

DEFAULT_MODE = "A1"  # 无 mode 字段时的默认值

# ─── 预编译正则 ─────────────────────────────────────────────
RE_ANSWER_CORRECT = re.compile(r"正确答案\s*([A-E]+)")
RE_ANSWER_PREFIX = re.compile(r"答案[：:]\s*([A-E]+)")
RE_ANSWER_PURE = re.compile(r"^[A-E]+$")
RE_OPTION_PREFIX = re.compile(r"^([A-E])[.．、]\s*")


# ─── 数据清洗函数 ───────────────────────────────────────────

def normalize_answer(raw: str) -> str:
    """将各种格式的 answer 归一化为纯大写字母。

    支持的输入格式：
        "C"                     → "C"
        "答案：C"               → "C"
        "答案:C"                → "C"
        "正确答案 ABCD，你的答案 BCD" → "ABCD"
    """
    raw = raw.strip()
    if not raw:
        return raw

    # 模式 1: "正确答案 X，你的答案 Y"
    m = RE_ANSWER_CORRECT.search(raw)
    if m:
        return m.group(1)

    # 模式 2: "答案：X" / "答案:X"
    m = RE_ANSWER_PREFIX.search(raw)
    if m:
        return m.group(1)

    # 模式 3: 纯字母
    m = RE_ANSWER_PURE.match(raw)
    if m:
        return m.group(0)

    # 兜底：尝试提取字符串中第一段连续大写字母
    m = re.search(r"[A-E]{2,}", raw)
    if m:
        return m.group(0)

    return raw


def normalize_mode(mode: str | None) -> str:
    """标准化题型编码。"""
    if not mode:
        return DEFAULT_MODE
    mode = mode.strip()
    return MODE_MAP.get(mode, mode)


def normalize_cls(cls: str) -> str:
    """标准化科目名称（去除首尾空格）。"""
    return cls.strip() if cls else ""


def parse_option(option_str: str) -> tuple[str, str]:
    """解析选项字符串，返回 (label, content) 元组。

    "A.脾亢"           → ("A", "脾亢")
    "A. 脾亢"          → ("A", "脾亢")
    "A、脾亢"          → ("A", "脾亢")
    """
    m = RE_OPTION_PREFIX.match(option_str)
    if m:
        label = m.group(1)
        content = option_str[m.end():].strip()
        return label, content
    return "", option_str.strip()


def compute_hash(text: str) -> str:
    """计算文本的 SHA256 哈希，用于去重。"""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# ─── 数据库操作 ────────────────────────────────────────────

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

-- 题目选项表
CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL
);

-- 题目主表
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    unit_id INTEGER NOT NULL REFERENCES units(id),
    mode TEXT NOT NULL,
    test TEXT NOT NULL,
    answer TEXT NOT NULL,
    point TEXT DEFAULT '',
    discuss TEXT DEFAULT '',
    source_name TEXT,
    content_hash TEXT UNIQUE NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_unit ON questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_mode ON questions(mode);
CREATE INDEX IF NOT EXISTS idx_options_question ON options(question_id);
"""


def create_schema(conn: sqlite3.Connection) -> None:
    """创建数据库表和索引。"""
    conn.executescript(SCHEMA_SQL)
    # 创建 FTS5 全文搜索虚拟表（单独执行，因 USING 不是标准 SQL）
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts
        USING fts5(test, discuss, point, content='questions', content_rowid='id')
    """)
    conn.commit()
    print(f"[√] 数据库表结构创建完成")


def get_or_create_subject(conn: sqlite3.Connection, name: str) -> int:
    """获取或创建科目记录，返回 subject_id。"""
    cur = conn.execute("SELECT id FROM subjects WHERE name = ?", (name,))
    row = cur.fetchone()
    if row is not None:
        return int(row[0])
    cur = conn.execute("INSERT INTO subjects (name) VALUES (?)", (name,))
    conn.commit()
    assert cur.lastrowid is not None
    return int(cur.lastrowid)


def get_or_create_unit(conn: sqlite3.Connection, subject_id: int, name: str) -> int:
    """获取或创建章节记录，返回 unit_id。"""
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


def import_question(
    conn: sqlite3.Connection,
    data: dict,
    stats: dict,
) -> bool:
    """导入单条题目数据。返回 True 表示成功插入。"""
    try:
        # 数据清洗
        cls_name = normalize_cls(data.get("cls", ""))
        mode = normalize_mode(data.get("mode"))
        test = data.get("test", "").strip()
        raw_answer = data.get("answer", "")
        answer = normalize_answer(raw_answer)
        point = data.get("point", "").strip() if data.get("point") else ""
        discuss = data.get("discuss", "").strip() if data.get("discuss") else ""
        unit_name = data.get("unit", "").strip()
        source_name = data.get("name", "")

        # 必填字段检查
        if not test or not cls_name:
            stats["errors"] += 1
            return False

        # 去重检查
        content_hash = compute_hash(test)

        # 维度表
        subject_id = get_or_create_subject(conn, cls_name)
        unit_id = get_or_create_unit(conn, subject_id, unit_name) if unit_name else subject_id

        # 插入题目（INSERT OR IGNORE 跳过重复）
        cur = conn.execute(
            """
            INSERT OR IGNORE INTO questions
                (subject_id, unit_id, mode, test, answer, point, discuss,
                 source_name, content_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (subject_id, unit_id, mode, test, answer, point, discuss,
             source_name, content_hash),
        )

        if cur.rowcount == 0:
            stats["skipped"] += 1
            return False

        assert cur.lastrowid is not None
        question_id = int(cur.lastrowid)

        # 插入选项
        options = data.get("option", [])
        for idx, opt in enumerate(options):
            if not isinstance(opt, str):
                continue
            label, content = parse_option(opt)
            if label:
                conn.execute(
                    """
                    INSERT INTO options (question_id, label, content, sort_order)
                    VALUES (?, ?, ?, ?)
                    """,
                    (question_id, label, content, idx),
                )

        stats["inserted"] += 1
        return True

    except Exception:
        stats["errors"] += 1
        return False


def import_directory(
    conn: sqlite3.Connection,
    dir_path: Path,
    stats: dict,
    batch_size: int = 1000,
) -> None:
    """遍历目录，批量导入 JSON 文件。"""
    if not dir_path.is_dir():
        print(f"[!] 目录不存在，跳过: {dir_path}")
        return

    json_files = sorted(dir_path.glob("*.json"))
    total = len(json_files)
    if total == 0:
        print(f"[!] 目录中无 JSON 文件: {dir_path}")
        return

    print(f"\n[*] 开始导入: {dir_path} ({total} 个文件)")

    for i, filepath in enumerate(json_files, 1):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError):
            stats["errors"] += 1
            continue
        except OSError:
            stats["errors"] += 1
            continue

        stats["total"] += 1
        import_question(conn, data, stats)

        # 定期提交事务，减少内存占用
        if i % batch_size == 0:
            conn.commit()
            print(
                f"  [{i}/{total}] "
                f"已处理 {stats['total']} | "
                f"插入 {stats['inserted']} | "
                f"跳过(重复) {stats['skipped']} | "
                f"错误 {stats['errors']}"
            )

    conn.commit()
    print(
        f"[√] 导入完成: {dir_path}\n"
        f"    文件: {total} | 插入: {stats['inserted'] - stats.get('_prev_inserted', 0)} | "
        f"跳过: {stats['skipped'] - stats.get('_prev_skipped', 0)} | "
        f"错误: {stats['errors'] - stats.get('_prev_errors', 0)}"
    )


def build_fts(conn: sqlite3.Connection) -> None:
    """填充 FTS5 全文搜索虚拟表。

    对于使用 content='questions' 的外部内容 FTS5 表，不能直接 DELETE 再 INSERT，
    必须使用 INSERT INTO ... VALUES('rebuild') 命令来同步外部内容。
    """
    print("\n[*] 构建 FTS5 全文搜索索引...")
    # 先清空，再触发外部内容同步
    conn.execute("INSERT INTO questions_fts(questions_fts) VALUES('rebuild')")
    conn.commit()
    count = conn.execute("SELECT COUNT(*) FROM questions_fts").fetchone()[0]
    print(f"[√] FTS5 索引构建完成，已索引 {count} 条题目")


def update_subject_counts(conn: sqlite3.Connection) -> None:
    """更新各科目题目数量统计。"""
    conn.execute("""
        UPDATE subjects SET question_count = (
            SELECT COUNT(*) FROM questions WHERE questions.subject_id = subjects.id
        )
    """)
    conn.commit()


def print_summary(conn: sqlite3.Connection, stats: dict) -> None:
    """打印导入统计摘要。"""
    print("\n" + "=" * 60)
    print("  导入统计摘要")
    print("=" * 60)

    # 总览
    q_count = conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    opt_count = conn.execute("SELECT COUNT(*) FROM options").fetchone()[0]
    sub_count = conn.execute("SELECT COUNT(*) FROM subjects").fetchone()[0]
    unit_count = conn.execute("SELECT COUNT(*) FROM units").fetchone()[0]

    print(f"  总处理文件:   {stats['total']}")
    print(f"  成功插入题目: {stats['inserted']}")
    print(f"  跳过(重复):   {stats['skipped']}")
    print(f"  错误:         {stats['errors']}")
    print(f"  ───────────────────────────")
    print(f"  questions 表: {q_count} 条")
    print(f"  options 表:   {opt_count} 条")
    print(f"  subjects 表:  {sub_count} 条")
    print(f"  units 表:     {unit_count} 条")

    # 各题型分布
    print(f"\n  题型分布:")
    for row in conn.execute(
        "SELECT mode, COUNT(*) FROM questions GROUP BY mode ORDER BY COUNT(*) DESC"
    ):
        print(f"    {row[0]:<6} {row[1]:>6} 题")

    # 科目分布 Top 10
    print(f"\n  科目分布 (Top 10):")
    for row in conn.execute(
        "SELECT name, question_count FROM subjects "
        "ORDER BY question_count DESC LIMIT 10"
    ):
        print(f"    {row[0]:<20} {row[1]:>6} 题")

    print("=" * 60)


# ─── 主入口 ─────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="将题库 JSON 文件转换为 SQLite 数据库"
    )
    parser.add_argument(
        "--db", type=str, default=str(DEFAULT_DB),
        help=f"输出数据库路径 (默认: {DEFAULT_DB})",
    )
    parser.add_argument(
        "--skip-fts", action="store_true",
        help="跳过 FTS5 全文搜索索引构建",
    )
    parser.add_argument(
        "--vacuum", action="store_true",
        help="导入完成后执行 VACUUM 压缩数据库",
    )
    parser.add_argument(
        "--overwrite", action="store_true",
        help="覆盖已有数据库文件（默认跳过）",
    )
    args = parser.parse_args()

    db_path = Path(args.db)

    # 检查数据库是否已存在
    if db_path.exists() and not args.overwrite:
        print(f"[!] 数据库已存在: {db_path}")
        print(f"    使用 --overwrite 参数覆盖，或手动删除后重试")
        sys.exit(1)

    print(f"[*] 题库 JSON → SQLite 转换")
    print(f"    数据库路径: {db_path}")
    print(f"    题库目录:   {VAULT_DIR}")
    print(f"    Undefined:  {UNDEFINED_DIR}")

    # 确保父目录存在
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # 连接数据库
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA journal_mode=WAL")       # 提高写入性能
    conn.execute("PRAGMA synchronous=NORMAL")     # 平衡安全与性能
    conn.execute("PRAGMA foreign_keys=ON")         # 启用外键约束

    # 创建表结构
    create_schema(conn)

    # 统计计数器
    stats = {"total": 0, "inserted": 0, "skipped": 0, "errors": 0}

    # 导入 tests_json_vault
    stats["_prev_inserted"] = stats["inserted"]
    stats["_prev_skipped"] = stats["skipped"]
    stats["_prev_errors"] = stats["errors"]
    import_directory(conn, VAULT_DIR, stats)

    # 导入 undefined（补充无 mode 字段的题目）
    stats["_prev_inserted"] = stats["inserted"]
    stats["_prev_skipped"] = stats["skipped"]
    stats["_prev_errors"] = stats["errors"]
    import_directory(conn, UNDEFINED_DIR, stats)

    # 清理临时统计字段
    for k in ("_prev_inserted", "_prev_skipped", "_prev_errors"):
        stats.pop(k, None)

    # 更新科目计数
    update_subject_counts(conn)

    # 构建 FTS 索引
    if not args.skip_fts:
        build_fts(conn)
    else:
        print("\n[*] 跳过 FTS5 索引构建 (--skip-fts)")

    # VACUUM 压缩
    if args.vacuum:
        print("\n[*] 执行 VACUUM 压缩...")
        conn.execute("VACUUM")
        print("[√] 压缩完成")

    # 打印摘要
    print_summary(conn, stats)

    # 输出数据库大小
    db_size = db_path.stat().st_size
    if db_size > 1024 * 1024:
        print(f"\n  数据库大小: {db_size / 1024 / 1024:.1f} MB")
    else:
        print(f"\n  数据库大小: {db_size / 1024:.1f} KB")

    conn.close()
    print("\n[√] 转换完成！")


if __name__ == "__main__":
    main()
