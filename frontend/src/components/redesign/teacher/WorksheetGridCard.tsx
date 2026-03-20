import { Download, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorksheetGridCardProps {
  title: string;
  status: 'draft' | 'published';
  onEdit: () => void;
  onPdfExport: () => void;
}

export function WorksheetGridCard({ title, status, onEdit, onPdfExport }: WorksheetGridCardProps) {
  const statusLabel = status === 'published' ? 'Đã xuất bản' : 'Bản nháp';

  return (
    <Card className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-6 text-slate-900">{title}</CardTitle>
          <Badge className={status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Sửa
        </Button>
        <Button variant="outline" className="flex-1" onClick={onPdfExport}>
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </CardContent>
    </Card>
  );
}
