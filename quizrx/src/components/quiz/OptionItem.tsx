import type { ReactNode } from "react";
import { Check, X as XIcon, Square } from "lucide-react";

interface OptionItemProps {
  selected: boolean;
  submitted: boolean;
  correct: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  multi?: boolean; // 多选题显示方块指示器
  className?: string;
  children: ReactNode;
}

/**
 * 单个选项行。提交后根据 selected/correct 显示绿/红/灰配色。
 * 移植自 MedQuiz，使用 --quiz-* 令牌。
 */
export function OptionItem({
  selected,
  submitted,
  correct,
  onClick,
  onDoubleClick,
  multi = false,
  className = "",
  children,
}: OptionItemProps) {
  const base = "flex items-center justify-between p-2 mb-1 rounded cursor-pointer border";

  let conditional = "";
  if (submitted) {
    if (selected && correct) {
      conditional =
        "bg-[hsl(var(--quiz-user-correct)/0.4)] border-2 border-[hsl(var(--quiz-user-correct))]";
    } else if (!selected && correct) {
      conditional =
        "bg-[hsl(var(--quiz-missed-correct)/0.2)] border border-[hsl(var(--quiz-missed-correct))]";
    } else if (selected && !correct) {
      conditional =
        "bg-[hsl(var(--quiz-user-incorrect)/0.2)] border-2 border-[hsl(var(--quiz-user-incorrect))]";
    } else {
      conditional =
        "bg-[hsl(var(--quiz-default-incorrect)/0.2)] border border-[hsl(var(--quiz-default-incorrect))]";
    }
  } else {
    conditional = selected
      ? "bg-muted border-2 border-primary"
      : "hover:bg-muted hover:border-dashed";
  }

  return (
    <div className={`${base} ${conditional} ${className}`} onClick={onClick} onDoubleClick={onDoubleClick}>
      {children}
      <div className="flex items-center gap-1">
        {multi && !submitted && (
          <Square
            size={16}
            className={selected ? "text-primary fill-current" : "text-muted-foreground/40"}
            style={{ borderRadius: 4 }}
          />
        )}
        {submitted && (
          <>
            {selected &&
              (correct ? (
                <Check size={16} className="text-[hsl(var(--quiz-user-correct))]" />
              ) : (
                <XIcon size={16} className="text-[hsl(var(--quiz-user-incorrect))]" />
              ))}
            {!selected && correct && (
              <Check size={16} className="text-[hsl(var(--quiz-missed-correct))]" />
            )}
            {!selected && !correct && <Square size={16} className="text-transparent" />}
          </>
        )}
      </div>
    </div>
  );
}
