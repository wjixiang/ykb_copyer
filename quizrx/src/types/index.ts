// ===== 与 Rust 后端 (src-tauri/src/models.rs) 一一对应的数据契约 =====

export type QuestionType = "A1" | "A2" | "A3" | "X";

export interface QuizOption {
  /** A / B / C / D / E */
  label: string;
  /** 已去掉前缀字母的选项文本 */
  content: string;
}

export interface Analysis {
  point: string;
  discuss: string;
  links: string[];
}

export interface SubQuestion {
  subId: number;
  stem: string;
  options: QuizOption[];
  answer: string;
}

interface QuestionBase {
  id: number;
  subject: string;
  unit: string;
  source: string | null;
  extractedYear: number | null;
  analysis: Analysis;
}

export interface SingleChoice extends QuestionBase {
  type: "A1" | "A2";
  stem: string;
  options: QuizOption[];
  answer: string;
}

export interface MultiChoice extends QuestionBase {
  type: "X";
  stem: string;
  options: QuizOption[];
  answer: string[];
}

export interface CaseQuestion extends QuestionBase {
  type: "A3";
  stem: string;
  subQuestions: SubQuestion[];
}

export type Question = SingleChoice | MultiChoice | CaseQuestion;

// ===== 轻量查询结构 =====

export interface Subject {
  id: number;
  name: string;
  questionCount: number;
}

export interface Unit {
  id: number;
  subjectId: number;
  name: string;
  questionCount: number;
}

export interface SearchHit {
  id: number;
  type: QuestionType;
  subject: string;
  stem: string;
  source: string | null;
  extractedYear: number | null;
}

export interface QuizConfig {
  unitId?: number | null;
  subjectId?: number | null;
  types?: QuestionType[];
  count: number;
  randomize?: boolean;
}

export interface Stats {
  totalQuestions: number;
  totalSubjects: number;
  totalUnits: number;
  typeBreakdown: [QuestionType, number][];
  subjectBreakdown: Subject[];
}
