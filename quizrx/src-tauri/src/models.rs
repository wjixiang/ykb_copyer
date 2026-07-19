use serde::{Deserialize, Serialize};

/// 单个选项。`label` 为 A/B/C/D/E，`content` 为去掉前缀字母的选项文本。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizOption {
    pub label: String,
    pub content: String,
}

/// 解析信息。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Analysis {
    #[serde(default)]
    pub point: String,
    #[serde(default)]
    pub discuss: String,
    #[serde(default)]
    pub links: Vec<String>,
}

/// A3 案例题的子题。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubQuestion {
    pub sub_id: i64,
    pub stem: String,
    pub options: Vec<QuizOption>,
    pub answer: String,
}

/// 单选题（A1/A2）数据体。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SingleChoice {
    pub id: i64,
    pub subject: String,
    pub unit: String,
    pub stem: String,
    pub options: Vec<QuizOption>,
    pub answer: String,
    pub analysis: Analysis,
    pub source: Option<String>,
    pub extracted_year: Option<i64>,
}

/// 多选题（X）数据体。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MultiChoice {
    pub id: i64,
    pub subject: String,
    pub unit: String,
    pub stem: String,
    pub options: Vec<QuizOption>,
    pub answer: Vec<String>,
    pub analysis: Analysis,
    pub source: Option<String>,
    pub extracted_year: Option<i64>,
}

/// 案例题（A3）数据体。`stem` 为共用题干，子题在 `sub_questions`。
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaseQuestion {
    pub id: i64,
    pub subject: String,
    pub unit: String,
    pub stem: String,
    pub sub_questions: Vec<SubQuestion>,
    pub analysis: Analysis,
    pub source: Option<String>,
    pub extracted_year: Option<i64>,
}

/// 判别联合。序列化为 `{ "type": "A1" | "A2" | "X" | "A3", ... }`，
/// 与前端 TypeScript 联合类型一一对应。
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type")]
pub enum Question {
    #[serde(rename = "A1")]
    A1(SingleChoice),
    #[serde(rename = "A2")]
    A2(SingleChoice),
    #[serde(rename = "X")]
    X(MultiChoice),
    #[serde(rename = "A3")]
    A3(CaseQuestion),
}

// ===== 查询返回的轻量结构 =====

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Subject {
    pub id: i64,
    pub name: String,
    pub question_count: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Unit {
    pub id: i64,
    pub subject_id: i64,
    pub name: String,
    pub question_count: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchHit {
    pub id: i64,
    #[serde(rename = "type")]
    pub type_: String,
    pub subject: String,
    pub stem: String,
    pub source: Option<String>,
    pub extracted_year: Option<i64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub total_questions: i64,
    pub total_subjects: i64,
    pub total_units: i64,
    pub type_breakdown: Vec<(String, i64)>,
    pub subject_breakdown: Vec<Subject>,
}

/// 开始刷题的配置。
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizConfig {
    /// 指定章节（优先于 subject_id）
    pub unit_id: Option<i64>,
    pub subject_id: Option<i64>,
    /// 限定题型，空表示全部
    pub types: Vec<String>,
    /// 抽取题数
    pub count: u32,
    /// 是否随机打乱
    pub randomize: Option<bool>,
}
