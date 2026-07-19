import { useState, useEffect, useCallback, useMemo } from "react";
import type { Question } from "@/types";
import { shuffleArray } from "@/lib/utils";

/**
 * 单题交互逻辑（移植自 MedQuiz useQuizLogic，剥离登录/历史/相似题/AI）。
 * 维护：当前选中、是否提交、整体正误、A3 子题正误、选项乱序。
 */
export function useQuizLogic(quiz: Question) {
  const initial = useMemo(() => {
    switch (quiz.type) {
      case "X":
        return [] as string[];
      case "A3":
        return {} as Record<number, string>;
      default:
        return "";
    }
  }, [quiz]);

  const [selected, setSelected] = useState<string | string[] | Record<number, string>>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [subCorrectness, setSubCorrectness] = useState<Record<number, boolean>>({});
  const [shuffledOptions, setShuffledOptions] = useState<
    Record<string, { label: string; content: string }[]>
  >({});

  // 题目切换时重置
  useEffect(() => {
    setSelected(initial);
    setSubmitted(false);
    setIsCorrect(false);
    setSubCorrectness({});
  }, [quiz.id, initial]);

  // 生成乱序选项（每题一次）
  useEffect(() => {
    const map: Record<string, { label: string; content: string }[]> = {};
    if (quiz.type === "A1" || quiz.type === "A2" || quiz.type === "X") {
      map[`${quiz.id}`] = shuffleArray(quiz.options);
    } else if (quiz.type === "A3") {
      for (const sub of quiz.subQuestions) {
        map[`${quiz.id}-${sub.subId}`] = shuffleArray(sub.options);
      }
    }
    setShuffledOptions(map);
  }, [quiz.id]);

  const getShuffled = useCallback(
    (options: { label: string; content: string }[], key: string | number) => {
      const id = key === "" ? `${quiz.id}` : `${quiz.id}-${key}`;
      return shuffledOptions[id] ?? options;
    },
    [quiz.id, shuffledOptions],
  );

  const handleOptionSelect = useCallback(
    (label: string, subId?: number) => {
      if (submitted) return;
      if (quiz.type === "A1" || quiz.type === "A2") {
        setSelected(label);
      } else if (quiz.type === "X") {
        setSelected((prev) => {
          const arr = prev as string[];
          return arr.includes(label) ? arr.filter((x) => x !== label) : [...arr, label];
        });
      } else if (quiz.type === "A3") {
        setSelected((prev) => ({ ...(prev as Record<number, string>), [subId!]: label }));
      }
    },
    [quiz.type, submitted],
  );

  const hasSelection = useCallback((): boolean => {
    if (quiz.type === "A1" || quiz.type === "A2") return selected !== "";
    if (quiz.type === "X") return (selected as string[]).length > 0;
    if (quiz.type === "A3")
      return quiz.subQuestions.every((s) => (selected as Record<number, string>)[s.subId] !== undefined);
    return false;
  }, [quiz, selected]);

  const calculateCorrectness = useCallback(() => {
    if (quiz.type === "A1" || quiz.type === "A2") {
      return selected === quiz.answer;
    }
    if (quiz.type === "X") {
      const a = [...(selected as string[])].sort().join("");
      const b = [...quiz.answer].sort().join("");
      return a === b;
    }
    // A3
    const map: Record<number, boolean> = {};
    const all = quiz.subQuestions.every((sub) => {
      const ok = (selected as Record<number, string>)[sub.subId] === sub.answer;
      map[sub.subId] = ok;
      return ok;
    });
    setSubCorrectness(map);
    return all;
  }, [quiz, selected]);

  const handleSubmit = useCallback(() => {
    if (!hasSelection()) return false;
    setSubmitted(true);
    const correct = calculateCorrectness();
    setIsCorrect(correct);
    return correct;
  }, [hasSelection, calculateCorrectness]);

  return {
    selected,
    submitted,
    isCorrect,
    subCorrectness,
    getShuffled,
    handleOptionSelect,
    hasSelection,
    handleSubmit,
  };
}
