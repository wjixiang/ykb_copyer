import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getQuestions } from "@/lib/invoke";
import type { Question, QuestionType } from "@/types";
import { useQuizLogic } from "@/hooks/useQuizLogic";
import { QuizContent } from "@/components/quiz/QuizContent";
import { QuizAnalysis } from "@/components/quiz/QuizAnalysis";

const TYPE_LABEL: Record<QuestionType, string> = {
  A1: "单选",
  A2: "案例单选",
  A3: "共用题干",
  X: "多选",
};

export function QuizSessionPage() {
  const { state } = useLocation() as { state: { ids: number[] } | null };
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!state?.ids?.length) {
      navigate("/quiz", { replace: true });
      return;
    }
    getQuestions(state.ids)
      .then((qs) => {
        setQuestions(qs);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [state, navigate]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">加载题目中…</div>;
  }
  if (!questions.length) {
    return <div className="p-8 text-center text-muted-foreground">没有找到题目。</div>;
  }

  const current = questions[index];
  return (
    <QuizQuestion
      key={current.id}
      quiz={current}
      index={index}
      total={questions.length}
      onPrev={() => setIndex((i) => Math.max(0, i - 1))}
      onNext={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
      onExit={() => navigate("/quiz")}
    />
  );
}

function QuizQuestion({
  quiz,
  index,
  total,
  onPrev,
  onNext,
  onExit,
}: {
  quiz: Question;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const {
    selected,
    submitted,
    isCorrect,
    subCorrectness,
    getShuffled,
    handleOptionSelect,
    hasSelection,
    handleSubmit,
  } = useQuizLogic(quiz);

  const progress = ((index + 1) / total) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* 顶部：进度与题型 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-1" /> 退出
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {index + 1} / {total} 题
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">{quiz.subject}</CardTitle>
            <Badge variant="secondary">{TYPE_LABEL[quiz.type]}</Badge>
            {quiz.extractedYear && <Badge variant="outline">{quiz.extractedYear}年</Badge>}
            {quiz.source && <Badge variant="outline">{quiz.source}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <QuizContent
            quiz={quiz}
            selected={selected}
            submitted={submitted}
            subCorrectness={subCorrectness}
            onSelect={handleOptionSelect}
            getShuffled={getShuffled}
          />

          {/* 提交与反馈 */}
          {!submitted ? (
            <Button className="w-full" disabled={!hasSelection()} onClick={() => handleSubmit()}>
              提交答案
            </Button>
          ) : (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-2 p-3 rounded-md font-medium ${
                  isCorrect
                    ? "bg-[hsl(var(--quiz-user-correct)/0.15)] text-[hsl(var(--quiz-user-correct))]"
                    : "bg-[hsl(var(--quiz-user-incorrect)/0.15)] text-[hsl(var(--quiz-user-incorrect))]"
                }`}
              >
                {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {isCorrect ? "回答正确" : "回答错误"}
              </div>
              <QuizAnalysis analysis={quiz.analysis} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 底部导航 */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} disabled={index === 0}>
          <ArrowLeft className="h-4 w-4 mr-1" /> 上一题
        </Button>
        <Button variant="outline" onClick={onNext} disabled={index === total - 1}>
          下一题 <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
