import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSubjects } from "@/lib/invoke";
import type { Subject } from "@/types";

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">全部科目</h2>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-3">
          {subjects.map((s) => (
            <Link key={s.id} to={`/subjects/${s.id}`}>
              <Card className="hover:border-primary transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-medium">{s.name}</span>
                  <Badge variant="secondary">{s.questionCount} 题</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
