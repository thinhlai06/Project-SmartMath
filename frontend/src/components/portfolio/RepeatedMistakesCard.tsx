import { AlertTriangle } from 'lucide-react';

import type { RepeatedMistake } from '@/types/studentPortfolio';

interface RepeatedMistakesCardProps {
    mistakes: RepeatedMistake[];
}

export function RepeatedMistakesCard({ mistakes }: RepeatedMistakesCardProps) {
    if (!mistakes.length) {
        return <p className="text-sm text-slate-500">Chưa ghi nhận lỗi lặp lại cho học sinh này.</p>;
    }

    return (
        <div className="space-y-3">
            {mistakes.slice(0, 5).map((mistake) => (
                <div key={mistake.error_type} className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-semibold text-amber-800">
                            <AlertTriangle className="h-4 w-4" />
                            {mistake.error_type}
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-amber-700">{mistake.count} lần</span>
                    </div>
                    {mistake.latest_detail && <p className="mt-2 text-sm text-amber-700">{mistake.latest_detail}</p>}
                </div>
            ))}
        </div>
    );
}
