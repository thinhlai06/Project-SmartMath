import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ClassCardProps {
  className: string;
  studentCount: number;
  href: string;
}

export function ClassCard({ className, studentCount, href }: ClassCardProps) {
  const formattedStudentCount = new Intl.NumberFormat('vi-VN').format(studentCount);

  return (
    <Card className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 break-words">{className}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span className="tabular-nums">{formattedStudentCount} học sinh</span>
          </div>
        </div>

        <Button asChild className="w-full focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
          <Link to={href}>
          Xem chi tiết lớp
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
