import { Download, Pencil, Copy, Trash2, Send, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorksheetGridCardProps {
  title: string;
  status: 'draft' | 'published';
  type: 'cpa' | 'differentiation' | string;
  exerciseCount: number;
  editHref: string;
  onPublish: () => void;
  onUnpublish: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPdfExport: () => void;
}

export function WorksheetGridCard({ 
  title, status, type, exerciseCount, 
  editHref, onPublish, onUnpublish, onDuplicate, onDelete, onPdfExport 
}: WorksheetGridCardProps) {
  const statusLabel = status === 'published' ? 'Đã xuất bản' : 'Bản nháp';
  const typeLabel = type === 'cpa' ? 'CPA' : type === 'differentiation' ? 'Phân hóa' : type;

  return (
    <Card className="glass-panel card-hover border-slate-100 overflow-hidden group rounded-3xl relative z-10 h-full flex flex-col bg-white/80">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/60 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125" />
      <CardHeader className="pb-4 px-5 pt-6 flex-grow">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={`rounded-full px-3 py-1 font-semibold ${status === 'published' ? 'bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 border-none hover:bg-slate-200'}`}>
              {statusLabel}
            </Badge>
            <Badge className={`rounded-full px-3 py-1 font-semibold border-none ${type === 'cpa' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {typeLabel}
            </Badge>
            <Badge className="rounded-full px-3 py-1 font-semibold bg-white text-slate-600 border border-slate-200">
              {exerciseCount} câu
            </Badge>
          </div>
          <CardTitle className="min-w-0 text-xl font-bold leading-tight text-slate-800 break-words group-hover:text-indigo-700 transition-colors line-clamp-3 mt-1">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5 pb-5">
        {/* Main actions */}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold border-none shadow-sm transition-all h-10">
            <Link to={editHref}>
              <Pencil className="h-4 w-4 mr-2" />
              Sửa
            </Link>
          </Button>
          {status === 'draft' ? (
             <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-sm transition-all h-10" onClick={onPublish}>
               <Send className="h-4 w-4 mr-2" />
               Xuất bản
             </Button>
          ) : (
             <Button variant="outline" className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-semibold border-none shadow-sm transition-all h-10" onClick={onUnpublish}>
               <EyeOff className="h-4 w-4 mr-2" />
               Hủy XB
             </Button>
          )}
        </div>
        {/* Secondary actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
           <div className="flex gap-1">
             <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" onClick={onDuplicate} title="Nhân bản">
               <Copy className="h-4 w-4" />
             </Button>
             <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" onClick={onPdfExport} title="Xuất PDF">
               <Download className="h-4 w-4" />
             </Button>
           </div>
           <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={onDelete} title="Xóa bài tập">
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
