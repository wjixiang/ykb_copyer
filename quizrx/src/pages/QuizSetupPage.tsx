import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSubjects, getUnits, getQuizIds } from "@/lib/invoke";
import type { Subject, Unit } from "@/types";

export function QuizSetupPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    if (subjectId == null) return;
    setUnitId(null);
    getUnits(subjectId).then(setUnits).catch(console.error);
  }, [subjectId]);

  const start = async () => {
    setLoading(true);
    try {
      const ids = await getQuizIds({
        unitId: unitId ?? undefined,
        subjectId: unitId ? undefined : subjectId ?? undefined,
        count,
        randomize: true,
      });
      if (!ids.length) {
        alert("该范围没有题目");
        return;
      }
      navigate("/quiz/session", { state: { ids } });
    } catch (e) {
      console.error(e);
      alert("开始刷题失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> 返回首页
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>选择科目</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="grid grid-cols-2 gap-2 pr-3">
              {subjects.map((s) => (
                <Button
                  key={s.id}
                  variant={subjectId === s.id ? "default" : "outline"}
                  className="justify-between"
                  onClick={() => setSubjectId(s.id)}
                >
                  <span className="truncate">{s.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {s.questionCount}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {subjectId != null && (
        <Card>
          <CardHeader>
            <CardTitle>选择章节（可选，默认整科）</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-1 pr-3">
                <Button
                  variant={unitId === null ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setUnitId(null)}
                >
                  全部章节
                </Button>
                {units.map((u) => (
                  <Button
                    key={u.id}
                    variant={unitId === u.id ? "default" : "outline"}
                    className="w-full justify-between"
                    onClick={() => setUnitId(u.id)}
                  >
                    <span className="truncate text-sm">{u.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {u.questionCount}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>题数</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
          />
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" disabled={loading} onClick={start}>
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
        开始刷题
      </Button>
    </div>
  );
}
