import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStats } from "@/lib/invoke";
import type { Stats } from "@/types";

export function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-primary">医学题库</h1>
        <p className="text-muted-foreground mt-1">本地离线刷题 · 共 6 万+ 真题</p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="题目" value={stats.totalQuestions} />
          <StatCard label="科目" value={stats.totalSubjects} />
          <StatCard label="章节" value={stats.totalUnits} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button size="lg" className="h-20 text-base" onClick={() => navigate("/quiz")}>
          <Play className="h-5 w-5 mr-2" /> 开始刷题
        </Button>
        <Button size="lg" variant="outline" className="h-20 text-base" onClick={() => navigate("/subjects")}>
          <BookOpen className="h-5 w-5 mr-2" /> 浏览科目
        </Button>
        <Button size="lg" variant="outline" className="h-20 text-base" onClick={() => navigate("/search")}>
          <Search className="h-5 w-5 mr-2" /> 搜索
        </Button>
      </div>

      {stats && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">热门科目</h3>
            <div className="flex flex-wrap gap-2">
              {stats.subjectBreakdown.map((s) => (
                <Badge
                  key={s.id}
                  variant="secondary"
                  className="cursor-pointer text-sm py-1.5 px-3"
                  onClick={() => navigate("/quiz")}
                >
                  {s.name} · {s.questionCount}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
