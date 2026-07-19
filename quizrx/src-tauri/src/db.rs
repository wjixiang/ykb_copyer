use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

/// 全局共享的 SQLite 连接（只读）。
pub struct DbState(pub Mutex<Connection>);

/// 以只读方式打开 quizbank.db。
///
/// 路径解析顺序：
/// 1. Tauri resource 目录（打包后由 `tauri.conf.json` 的 resources 提供）
/// 2. 开发期仓库根的 quizbank.db（quizrx/src-tauri/../quizbank.db）
/// 3. 兜底绝对路径
pub fn open_db(app: &AppHandle) -> Result<Connection, String> {
    let candidates: Vec<PathBuf> = [
        app.path()
            .resource_dir()
            .ok()
            .map(|p| p.join("quizbank.db")),
        app.path()
            .resource_dir()
            .ok()
            .map(|p| p.join("assets").join("quizbank.db")),
        // 开发期：quizrx/src-tauri/../../quizbank.db
        std::env::current_dir().ok().map(|d| d.join("../../quizbank.db")),
        std::env::current_dir()
            .ok()
            .map(|d| d.join("../quizbank.db")),
        Some(PathBuf::from("/mnt/disk3/ykb_copyer/quizbank.db")),
    ]
    .into_iter()
    .flatten()
    .collect();

    for path in &candidates {
        if path.exists() {
            return Connection::open_with_flags(
                path,
                rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY
                    | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
            )
            .map_err(|e| format!("打开数据库 {:?} 失败: {}", path, e));
        }
    }

    Err(format!(
        "找不到 quizbank.db，已尝试以下路径:\n{:?}",
        candidates
    ))
}
