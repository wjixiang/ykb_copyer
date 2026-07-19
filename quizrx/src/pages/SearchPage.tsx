import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchQuestions, getQuestions } from "@/lib/invoke";
import type { SearchHit } from "@/types";

export function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      setResults(await searchQuestions(keyword.trim()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openQuestion = async (id: number) => {
    // 单题也走会话页（一条题）
    const q = await getQuestions([id]);
    navigate("/quiz/session", { state: { ids: [q[0].id] } });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="搜索题干、解析（如 体液 内环境）…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <Button onClick={onSearch} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-2 pr-3">
          {results.map((hit) => (
            <Card key={hit.id} className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-3 space-y-1" onClick={() => openQuestion(hit.id)}>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{hit.type}</Badge>
                  {hit.subject && <span className="text-xs text-muted-foreground">{hit.subject}</span>}
                </div>
                <p className="text-sm line-clamp-2">{hit.stem}</p>
              </CardContent>
            </Card>
          ))}
          {!loading && results.length === 0 && keyword && (
            <p className="text-center text-muted-foreground py-8">没有匹配结果</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
