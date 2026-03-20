import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GradingDiffViewerProps {
  ocrText: string;
  expectedText: string;
  confidenceScore: number;
  onOverride: (correctedText: string) => void;
}

const LOW_CONFIDENCE_THRESHOLD = 85;

export function GradingDiffViewer({
  ocrText,
  expectedText,
  confidenceScore,
  onOverride,
}: GradingDiffViewerProps) {
  const [correctedText, setCorrectedText] = useState(ocrText);
  const scoreFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">Đối chiếu OCR và đáp án</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {confidenceScore < LOW_CONFIDENCE_THRESHOLD && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>
              Độ tin cậy OCR <span className="tabular-nums">{scoreFormatter.format(confidenceScore)}%</span> thấp hơn ngưỡng{' '}
              <span className="tabular-nums">{scoreFormatter.format(LOW_CONFIDENCE_THRESHOLD)}%</span>. Giáo viên nên kiểm tra thủ công.
            </p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">OCR đọc được</p>
            <p className="text-sm text-slate-900">{ocrText || '(trống)'}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-emerald-50 p-3">
            <p className="mb-1 text-xs font-semibold uppercase text-emerald-600">Đáp án kỳ vọng</p>
            <p className="text-sm text-slate-900">{expectedText || '(trống)'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="override-input" className="text-sm font-medium text-slate-700">
            Sửa kết quả OCR
          </label>
          <Input
            id="override-input"
            value={correctedText}
            onChange={(e) => setCorrectedText(e.target.value)}
            placeholder="Nhập nội dung đúng"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={() => onOverride(correctedText)} disabled={!correctedText.trim()}>
          Lưu chỉnh sửa
        </Button>
      </CardFooter>
    </Card>
  );
}
