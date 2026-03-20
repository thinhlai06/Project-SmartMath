import { useMemo, useState } from 'react';
import { Loader2, WandSparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AICreatorPanelProps {
  topics: string[];
  onGenerate: (params: { topic: string; diffLevel: number }) => Promise<void>;
  isLoading: boolean;
}

export function AICreatorPanel({ topics, onGenerate, isLoading }: AICreatorPanelProps) {
  const defaultTopic = useMemo(() => topics[0] ?? '', [topics]);
  const [topic, setTopic] = useState(defaultTopic);
  const [diffLevel, setDiffLevel] = useState<1 | 2 | 3>(1);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topic || isLoading) {
      return;
    }
    await onGenerate({ topic, diffLevel });
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <WandSparkles className="h-4 w-4 text-teal-600" />
          Tạo câu hỏi AI (Bản nháp)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="ai-topic">Chủ đề Toán (Lớp 1-3)</Label>
            <select
              id="ai-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Mức độ</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={diffLevel === level ? 'default' : 'outline'}
                  onClick={() => setDiffLevel(level as 1 | 2 | 3)}
                >
                  Mức {level}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full focus-visible:ring-2 focus-visible:ring-teal-500" disabled={!topic || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo bản nháp…
              </>
            ) : (
              'Tạo nội dung nháp'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
