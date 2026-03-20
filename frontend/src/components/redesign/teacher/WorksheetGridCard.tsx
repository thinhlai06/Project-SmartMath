import { Download, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorksheetGridCardProps {
  title: string;
  status: 'draft' | 'published';
  editHref: string;
  onPdfExport: () => void;
}

export function WorksheetGridCard({ title, status, editHref, onPdfExport }: WorksheetGridCardProps) {
  const statusLabel = status === 'published' ? 'Đã xuất bản' : 'Bản nháp';

  return (
    <Card className="glass-panel card-hover border-none overflow-hidden group rounded-3xl relative z-10 h-full flex flex-col">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/60 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125" />
      <CardHeader className="pb-4 px-6 pt-6 flex-grow">
        <div className="flex flex-col gap-3">
          <Badge className={`w-fit rounded-full px-3 py-1 font-semibold ${status === 'published' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
            {statusLabel}
          </Badge>
          <CardTitle className="min-w-0 text-xl font-bold leading-tight text-slate-800 break-words group-hover:text-indigo-700 transition-colors line-clamp-3">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex gap-3 px-6 pb-6">
        <Button asChild variant="outline" className="btn-bounce flex-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-xl font-semibold border-none shadow-none group-hover:shadow-soft transition-all h-11">
          <Link to={editHref}>
            <Pencil className="h-4 w-4 mr-2" />
            Sửa
          </Link>
        </Button>
        <Button variant="outline" className="btn-bounce flex-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl font-semibold border-none shadow-none group-hover:shadow-soft transition-all h-11" onClick={onPdfExport}>
          <Download className="h-4 w-4 mr-2" />
          Xuất PDF
        </Button>
      </CardContent>
    </Card>
  );
}
