import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind class，移植自 MedQuiz。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fisher-Yates 洗牌（用于选项乱序），移植自 MedQuiz。 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/** 去掉选项文本开头的 "A. " 前缀（防御性，DB 通常已剥离）。 */
export function stripOptionPrefix(text: string): string {
  return text.replace(/^[A-E]\.\s*/, "");
}
