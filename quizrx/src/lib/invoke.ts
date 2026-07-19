import { invoke } from "@tauri-apps/api/core";
import type {
  Question,
  QuizConfig,
  SearchHit,
  Stats,
  Subject,
  Unit,
} from "@/types";

/** 获取全部科目（按题量倒序）。 */
export function getSubjects(): Promise<Subject[]> {
  return invoke<Subject[]>("get_subjects");
}

/** 获取某科目下的章节。 */
export function getUnits(subjectId: number): Promise<Unit[]> {
  return invoke<Unit[]>("get_units", { subjectId });
}

/** 按配置抽取题目 id 列表。 */
export function getQuizIds(config: QuizConfig): Promise<number[]> {
  return invoke<number[]>("get_quiz_ids", { config });
}

/** 按 id 获取完整题目。 */
export function getQuestion(id: number): Promise<Question> {
  return invoke<Question>("get_question", { id });
}

/** 批量获取题目。 */
export function getQuestions(ids: number[]): Promise<Question[]> {
  return invoke<Question[]>("get_questions", { ids });
}

/** FTS5 全文检索。 */
export function searchQuestions(keyword: string, limit = 50): Promise<SearchHit[]> {
  return invoke<SearchHit[]>("search_questions", { keyword, limit });
}

/** 题库统计。 */
export function getStats(): Promise<Stats> {
  return invoke<Stats>("get_stats");
}
