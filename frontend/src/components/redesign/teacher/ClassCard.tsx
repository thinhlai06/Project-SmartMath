import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ClassCardProps {
  className: string;
  studentCount: number;
  onClick: () => void;
}

export function ClassCard({ className, studentCount, onClick }: ClassCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{className}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span>{studentCount} học sinh</span>
          </div>
        </div>
        <Button className="w-full" onClick={onClick}>
          Xem chi tiết lớp
        </Button>
      </CardContent>
    </Card>
  );
}
