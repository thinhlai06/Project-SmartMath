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
    <Card className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-teal-400 focus-within:ring-offset-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="min-w-0 text-base leading-6 text-slate-900 break-words">{title}</CardTitle>
          <Badge className={status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button asChild variant="outline" className="flex-1 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-500">
          <Link to={editHref}>
            <Pencil className="h-4 w-4" />
            Sửa
          </Link>
        </Button>
        <Button variant="outline" className="flex-1 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-500" onClick={onPdfExport}>
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </CardContent>
    </Card>
  );
}
