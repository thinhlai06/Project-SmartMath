import { Download, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HomeworkActionCardProps {
  title: string;
  dueDate?: string;
  onDownload: () => void;
}

export function HomeworkActionCard({ title, dueDate, onDownload }: HomeworkActionCardProps) {
  const formattedDueDate = dueDate
    ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dueDate))
    : undefined;

  return (
    <Card className="border-orange-200 bg-white shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-orange-400 focus-within:ring-offset-2 [touch-action:manipulation]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formattedDueDate && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarClock className="h-4 w-4" />
            <span>Hạn nộp: {formattedDueDate}</span>
          </div>
        )}

        <Button onClick={onDownload} className="w-full hover:brightness-95 focus-visible:ring-2 focus-visible:ring-orange-500 [touch-action:manipulation]">
          <Download className="h-4 w-4" />
          Tải bài tập PDF
        </Button>
      </CardContent>
    </Card>
  );
}
