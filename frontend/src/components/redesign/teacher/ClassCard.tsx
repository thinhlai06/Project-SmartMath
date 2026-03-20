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
    <Card className="glass-panel card-hover border-none overflow-hidden group rounded-3xl">
      <CardContent className="p-6 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 opacity-60 transition-transform duration-500 group-hover:scale-125" />
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 break-words mb-2 group-hover:text-indigo-700 transition-colors">{className}</h3>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50/80 inline-flex px-3 py-1 rounded-full border border-slate-100">
            <Users className="h-4 w-4 text-indigo-500" />
            <span className="tabular-nums">{formattedStudentCount} học viên</span>
          </div>
        </div>

        <Button asChild className="btn-bounce w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl font-semibold shadow-none transition-all duration-300 group-hover:shadow-soft flex items-center justify-between px-5 h-12">
          <Link to={href}>
            <span>Xem chi tiết lớp</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
