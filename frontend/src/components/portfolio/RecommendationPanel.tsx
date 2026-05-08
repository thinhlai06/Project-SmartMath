import { Lightbulb } from 'lucide-react';

import type { PortfolioRecommendation } from '@/types/studentPortfolio';

interface RecommendationPanelProps {
    recommendations: PortfolioRecommendation[];
}

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
    if (!recommendations.length) {
        return <p className="text-sm text-slate-500">Chưa có gợi ý hành động.</p>;
    }

    return (
        <div className="space-y-3">
            {recommendations.map((item) => (
                <div key={item.title} className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                    <div className="flex items-center gap-2 font-semibold text-indigo-800">
                        <Lightbulb className="h-4 w-4" />
                        {item.title}
                    </div>
                    <p className="mt-2 text-sm text-indigo-700">{item.description}</p>
                    {item.is_draft && <p className="mt-2 text-xs font-semibold text-indigo-500">Gợi ý nháp - giáo viên quyết định áp dụng.</p>}
                </div>
            ))}
        </div>
    );
}
