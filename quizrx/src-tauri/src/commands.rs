use rusqlite::params;

use crate::db::DbState;
use crate::models::{
    Analysis, CaseQuestion, MultiChoice, Question, QuizConfig, QuizOption, SearchHit, SingleChoice,
    Stats, Subject, SubQuestion, Unit,
};

fn lock_err<T, E: std::fmt::Display>(r: Result<T, E>) -> Result<T, String> {
    r.map_err(|e| e.to_string())
}

/// 把 questions.answer 拆成字母数组（用于 X 多选题，如 "BCD" -> ["B","C","D"]）。
fn split_answer(answer: &str) -> Vec<String> {
    answer
        .chars()
        .filter(|c| c.is_ascii_alphabetic())
        .map(|c| c.to_string())
        .collect()
}

/// 读取某道题的选项（A1/A2/X 用）。
fn load_options(
    conn: &rusqlite::Connection,
    question_id: i64,
) -> Result<Vec<QuizOption>, String> {
    let mut stmt = lock_err(
        conn.prepare("SELECT label, content FROM options WHERE question_id = ?1 ORDER BY sort_order"),
    )?;
    let rows = lock_err(stmt.query_map(params![question_id], |row| {
        Ok(QuizOption {
            label: row.get(0)?,
            content: row.get::<_, Option<String>>(1)?.unwrap_or_default(),
        })
    }))?;
    let mut out = Vec::new();
    for r in rows {
        out.push(lock_err(r)?);
    }
    Ok(out)
}

/// 读取 A3 的子题及其选项。
fn load_sub_questions(
    conn: &rusqlite::Connection,
    question_id: i64,
) -> Result<Vec<SubQuestion>, String> {
    let mut stmt = lock_err(
        conn.prepare(
            "SELECT id, sub_quiz_id, stem, answer FROM sub_questions
             WHERE question_id = ?1 ORDER BY sort_order",
        ),
    )?;
    let rows = lock_err(stmt.query_map(params![question_id], |row| {
        Ok((
            row.get::<_, i64>(0)?,    // id
            row.get::<_, i64>(1)?,    // sub_quiz_id
            row.get::<_, String>(2)?, // stem
            row.get::<_, String>(3)?, // answer
        ))
    }))?;

    let mut out = Vec::new();
    for r in rows {
        let (sub_id_db, sub_quiz_id, stem, answer) = lock_err(r)?;
        let mut opt_stmt = lock_err(conn.prepare(
            "SELECT label, content FROM sub_options WHERE sub_question_id = ?1 ORDER BY sort_order",
        ))?;
        let opt_rows = lock_err(opt_stmt.query_map(params![sub_id_db], |row| {
            Ok(QuizOption {
                label: row.get(0)?,
                content: row.get::<_, Option<String>>(1)?.unwrap_or_default(),
            })
        }))?;
        let mut options = Vec::new();
        for o in opt_rows {
            options.push(lock_err(o)?);
        }
        out.push(SubQuestion {
            sub_id: sub_quiz_id,
            stem,
            options,
            answer,
        });
    }
    Ok(out)
}

#[tauri::command]
pub fn get_subjects(db: tauri::State<'_, DbState>) -> Result<Vec<Subject>, String> {
    let conn = lock_err(db.0.lock())?;
    let mut stmt = lock_err(conn.prepare(
        "SELECT id, name, question_count FROM subjects ORDER BY question_count DESC, id",
    ))?;
    let rows = lock_err(stmt.query_map([], |row| {
        Ok(Subject {
            id: row.get(0)?,
            name: row.get(1)?,
            question_count: row.get(2)?,
        })
    }))?;
    let mut out = Vec::new();
    for r in rows {
        out.push(lock_err(r)?);
    }
    Ok(out)
}

#[tauri::command]
pub fn get_units(
    db: tauri::State<'_, DbState>,
    subject_id: i64,
) -> Result<Vec<Unit>, String> {
    let conn = lock_err(db.0.lock())?;
    let mut stmt = lock_err(conn.prepare(
        "SELECT u.id, u.subject_id, u.name,
                (SELECT COUNT(*) FROM questions q WHERE q.unit_id = u.id) AS cnt
         FROM units u
         WHERE u.subject_id = ?1
         ORDER BY u.id",
    ))?;
    let rows = lock_err(stmt.query_map(params![subject_id], |row| {
        Ok(Unit {
            id: row.get(0)?,
            subject_id: row.get(1)?,
            name: row.get(2)?,
            question_count: row.get(3)?,
        })
    }))?;
    let mut out = Vec::new();
    for r in rows {
        out.push(lock_err(r)?);
    }
    Ok(out)
}

/// 根据配置抽取题目 id 列表（start_quiz）。
#[tauri::command]
pub fn get_quiz_ids(
    db: tauri::State<'_, DbState>,
    config: QuizConfig,
) -> Result<Vec<i64>, String> {
    let conn = lock_err(db.0.lock())?;

    let mut sql = String::from("SELECT q.id FROM questions q WHERE 1=1");
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    let mut conditions: Vec<String> = Vec::new();

    if let Some(uid) = config.unit_id {
        conditions.push(format!("q.unit_id = ?{}", params_vec.len() + 1));
        params_vec.push(Box::new(uid));
    } else if let Some(sid) = config.subject_id {
        conditions.push(format!("q.subject_id = ?{}", params_vec.len() + 1));
        params_vec.push(Box::new(sid));
    }

    if !config.types.is_empty() {
        let placeholders: Vec<String> = (0..config.types.len())
            .map(|i| format!("?{}", params_vec.len() + 1 + i))
            .collect();
        conditions.push(format!("q.type IN ({})", placeholders.join(",")));
        for t in &config.types {
            params_vec.push(Box::new(t.clone()));
        }
    }

    if !conditions.is_empty() {
        sql.push_str(" AND ");
        sql.push_str(&conditions.join(" AND "));
    }

    let randomize = config.randomize.unwrap_or(true);
    sql.push_str(if randomize {
        " ORDER BY RANDOM()"
    } else {
        " ORDER BY q.id"
    });
    sql.push_str(&format!(" LIMIT ?{}", params_vec.len() + 1));
    params_vec.push(Box::new(config.count));

    let mut stmt = lock_err(conn.prepare(&sql))?;
    let param_refs: Vec<&dyn rusqlite::ToSql> =
        params_vec.iter().map(|p| p.as_ref()).collect();
    let rows = lock_err(stmt.query_map(param_refs.as_slice(), |row| row.get::<_, i64>(0)))?;
    let mut out = Vec::new();
    for r in rows {
        out.push(lock_err(r)?);
    }
    Ok(out)
}

/// 按 id 获取完整题目（判别联合）。
#[tauri::command]
pub fn get_question(
    db: tauri::State<'_, DbState>,
    id: i64,
) -> Result<Question, String> {
    let conn = lock_err(db.0.lock())?;
    fetch_question(&conn, id)
}

/// 批量获取题目（避免前端逐题多次 IPC）。
#[tauri::command]
pub fn get_questions(
    db: tauri::State<'_, DbState>,
    ids: Vec<i64>,
) -> Result<Vec<Question>, String> {
    let conn = lock_err(db.0.lock())?;
    ids.into_iter().map(|id| fetch_question(&conn, id)).collect()
}

/// 获取单题的内部实现，复用于 get_question / get_questions。
fn fetch_question(conn: &rusqlite::Connection, id: i64) -> Result<Question, String> {
    let (type_, subject, unit, stem, answer, point, discuss, source, extracted_year) =
        lock_err(conn.query_row(
            "SELECT q.type, s.name, u.name, q.stem, q.answer, q.point, q.discuss, q.source, q.extracted_year
             FROM questions q
             JOIN subjects s ON s.id = q.subject_id
             LEFT JOIN units u ON u.id = q.unit_id
             WHERE q.id = ?1",
            params![id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, Option<String>>(2)?.unwrap_or_default(),
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                    row.get::<_, String>(5)?,
                    row.get::<_, String>(6)?,
                    row.get::<_, Option<String>>(7)?,
                    row.get::<_, Option<i64>>(8)?,
                ))
            },
        ))?;

    let analysis = Analysis {
        point,
        discuss,
        links: Vec::new(),
    };

    let question = match type_.as_str() {
        "A1" => Question::A1(SingleChoice {
            id,
            subject,
            unit,
            stem,
            options: load_options(conn, id)?,
            answer,
            analysis,
            source,
            extracted_year,
        }),
        "A2" => Question::A2(SingleChoice {
            id,
            subject,
            unit,
            stem,
            options: load_options(conn, id)?,
            answer,
            analysis,
            source,
            extracted_year,
        }),
        "X" => Question::X(MultiChoice {
            id,
            subject,
            unit,
            stem,
            options: load_options(conn, id)?,
            answer: split_answer(&answer),
            analysis,
            source,
            extracted_year,
        }),
        "A3" => Question::A3(CaseQuestion {
            id,
            subject,
            unit,
            stem,
            sub_questions: load_sub_questions(conn, id)?,
            analysis,
            source,
            extracted_year,
        }),
        other => {
            return Err(format!("未知题型: {}", other));
        }
    };

    Ok(question)
}

/// FTS5 全文检索。
#[tauri::command]
pub fn search_questions(
    db: tauri::State<'_, DbState>,
    keyword: String,
    limit: Option<u32>,
) -> Result<Vec<SearchHit>, String> {
    let conn = lock_err(db.0.lock())?;
    let limit = limit.unwrap_or(50) as i64;
    let mut stmt = lock_err(conn.prepare(
        "SELECT q.id, q.type, s.name, q.stem, q.source, q.extracted_year, bm25(questions_fts) AS rank
         FROM questions_fts
         JOIN questions q ON q.id = questions_fts.rowid
         JOIN subjects s ON s.id = q.subject_id
         WHERE questions_fts MATCH ?1
         ORDER BY rank
         LIMIT ?2",
    ))?;
    let rows = lock_err(stmt.query_map(params![keyword, limit], |row| {
        Ok(SearchHit {
            id: row.get(0)?,
            type_: row.get(1)?,
            subject: row.get(2)?,
            stem: row.get(3)?,
            source: row.get(4)?,
            extracted_year: row.get(5)?,
        })
    }))?;
    let mut out = Vec::new();
    for r in rows {
        out.push(lock_err(r)?);
    }
    Ok(out)
}

#[tauri::command]
pub fn get_stats(db: tauri::State<'_, DbState>) -> Result<Stats, String> {
    let conn = lock_err(db.0.lock())?;
    let total_questions: i64 =
        lock_err(conn.query_row("SELECT COUNT(*) FROM questions", [], |row| row.get(0)))?;
    let total_subjects: i64 =
        lock_err(conn.query_row("SELECT COUNT(*) FROM subjects", [], |row| row.get(0)))?;
    let total_units: i64 =
        lock_err(conn.query_row("SELECT COUNT(*) FROM units", [], |row| row.get(0)))?;

    let mut stmt = lock_err(conn.prepare(
        "SELECT type, COUNT(*) FROM questions GROUP BY type ORDER BY 2 DESC",
    ))?;
    let rows = lock_err(stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
    }))?;
    let mut type_breakdown = Vec::new();
    for r in rows {
        type_breakdown.push(lock_err(r)?);
    }

    let mut stmt = lock_err(conn.prepare(
        "SELECT id, name, question_count FROM subjects ORDER BY question_count DESC LIMIT 20",
    ))?;
    let rows = lock_err(stmt.query_map([], |row| {
        Ok(Subject {
            id: row.get(0)?,
            name: row.get(1)?,
            question_count: row.get(2)?,
        })
    }))?;
    let mut subject_breakdown = Vec::new();
    for r in rows {
        subject_breakdown.push(lock_err(r)?);
    }

    Ok(Stats {
        total_questions,
        total_subjects,
        total_units,
        type_breakdown,
        subject_breakdown,
    })
}
