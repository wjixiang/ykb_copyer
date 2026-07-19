import type { Analysis } from "@/types";

/** 要点 + 解析展示。Phase 1 使用纯文本（后续可接 react-markdown + KaTeX）。 */
export function QuizAnalysis({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-4">
      {analysis.point && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">课本出处</h4>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.point}</p>
          <div className="border-b border-border/50" />
        </div>
      )}
      {analysis.discuss && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">解析</h4>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.discuss}</p>
        </div>
      )}
    </div>
  );
}
