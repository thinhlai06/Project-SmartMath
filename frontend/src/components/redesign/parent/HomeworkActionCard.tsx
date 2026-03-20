import { Download, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HomeworkActionCardProps {
  title: string;
  dueDate?: string;
  onDownload: () => void;
}

export function HomeworkActionCard({ title, dueDate, onDownload }: HomeworkActionCardProps) {
  return (
    <Card className="border-orange-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dueDate && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarClock className="h-4 w-4" />
            <span>Hạn nộp: {dueDate}</span>
          </div>
        )}

        <Button onClick={onDownload} className="w-full">
          <Download className="h-4 w-4" />
          Tải bài tập PDF
        </Button>
      </CardContent>
    </Card>
  );
}
