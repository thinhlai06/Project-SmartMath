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
    <Card className="glass-panel card-hover border-none overflow-hidden group rounded-3xl relative z-10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="text-lg font-bold text-slate-800 leading-snug group-hover:text-orange-600 transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-6">
        {formattedDueDate && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-orange-50/80 inline-flex px-3 py-1.5 rounded-full border border-orange-100/50">
            <CalendarClock className="h-4 w-4 text-orange-500" />
            <span>Hạn nộp: {formattedDueDate}</span>
          </div>
        )}

        <Button onClick={onDownload} className="btn-bounce w-full bg-orange-500 text-white hover:bg-orange-600 rounded-2xl font-bold shadow-soft hover:shadow-soft-lg h-12 transition-all duration-300 border border-orange-400">
          <Download className="h-5 w-5 mr-2" />
          Tải bài tập PDF
        </Button>
      </CardContent>
    </Card>
  );
}
