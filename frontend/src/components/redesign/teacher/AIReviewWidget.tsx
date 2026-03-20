import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AIReviewWidgetProps {
  draftContent: string;
  onApprove: (content: string) => Promise<void> | void;
  onReject: () => void;
}

export function AIReviewWidget({ draftContent, onApprove, onReject }: AIReviewWidgetProps) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!draftContent.trim() || isApproving) {
      return;
    }

    setIsApproving(true);
    try {
      await onApprove(draftContent);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <CardTitle className="text-base text-amber-900">Nội dung AI cần duyệt</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-amber-100 bg-white p-3 text-sm leading-6 text-slate-700">
          {draftContent || 'Chưa có nội dung nháp từ AI.'}
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" className="focus-visible:ring-2 focus-visible:ring-amber-500" onClick={onReject} disabled={isApproving}>
          Từ chối
        </Button>
        <Button onClick={handleApprove} disabled={!draftContent.trim() || isApproving}>
          {isApproving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang duyệt…
            </>
          ) : (
            'Duyệt và thêm vào bài tập'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
