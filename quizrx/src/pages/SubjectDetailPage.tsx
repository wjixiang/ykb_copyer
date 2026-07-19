import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSubjects, getUnits, getQuizIds } from "@/lib/invoke";
import type { Subject, Unit } from "@/types";

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id);
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    getUnits(subjectId).then(setUnits).catch(console.error);
    getSubjects().then((all) => setSubject(all.find((s) => s.id === subjectId) ?? null));
  }, [subjectId]);

  const practice = async (unitId?: number) => {
    const ids = await getQuizIds({
      unitId,
      subjectId,
      count: 20,
      randomize: true,
    });
    if (ids.length) navigate("/quiz/session", { state: { ids } });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/subjects")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> 返回科目
      </Button>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{subject?.name ?? "…"}</h2>
        <Button size="sm" onClick={() => practice()}>
          <Play className="h-4 w-4 mr-1" /> 整科随机 20 题
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-2 pr-3">
          {units.map((u) => (
            <Card key={u.id} className="hover:border-primary transition-colors cursor-pointer">
              <CardContent
                className="p-3 flex items-center justify-between"
                onClick={() => practice(u.id)}
              >
                <span className="text-sm">{u.name}</span>
                <Badge variant="secondary">{u.questionCount}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
