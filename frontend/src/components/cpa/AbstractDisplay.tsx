import { Badge } from '@/components/ui/badge';
import type { AbstractSpec } from '@/types/cpaBundle';

interface AbstractDisplayProps {
    spec: AbstractSpec;
    renderedLatex?: string;
}

export function AbstractDisplay({ spec, renderedLatex }: AbstractDisplayProps) {
    return (
        <div className="space-y-3 rounded-2xl border border-violet-200/80 bg-violet-50/70 p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold uppercase tracking-wide text-violet-700">Abstract</p>
                <Badge className="bg-violet-100 text-violet-700 border border-violet-200/80">
                    {spec.show_blank ? 'Dien so' : 'Dang day du'}
                </Badge>
            </div>

            <div className="rounded-xl border border-violet-100 bg-white p-3 text-sm font-semibold text-slate-800">
                {renderedLatex || spec.expression}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-violet-200 bg-white px-3 py-1 font-semibold text-violet-700">
                    Dap an: {spec.answer}
                </span>
                {spec.hint && (
                    <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-slate-600">
                        Goi y: {spec.hint}
                    </span>
                )}
            </div>
        </div>
    );
}
