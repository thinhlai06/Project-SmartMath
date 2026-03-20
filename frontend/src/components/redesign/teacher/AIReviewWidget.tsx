import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AIReviewWidgetProps {
  draftContent: string;
  onApprove: (content: string) => void;
  onReject: () => void;
}

export function AIReviewWidget({ draftContent, onApprove, onReject }: AIReviewWidgetProps) {
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
        <Button variant="outline" onClick={onReject}>
          Từ chối
        </Button>
        <Button onClick={() => onApprove(draftContent)} disabled={!draftContent.trim()}>
          Duyệt và thêm vào bài tập
        </Button>
      </CardFooter>
    </Card>
  );
}
