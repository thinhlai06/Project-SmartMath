import { Badge } from '@/components/ui/badge';
import type { ConcreteSpec } from '@/types/cpaBundle';

interface ConcreteDisplayProps {
    spec: ConcreteSpec;
    renderedHtml?: string;
}

const sanitizeMarkup = (markup: string): string => {
    return markup
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/\son\w+=\"[^\"]*\"/gi, '')
        .replace(/\son\w+='[^']*'/gi, '');
};

export function ConcreteDisplay({ spec, renderedHtml }: ConcreteDisplayProps) {
    const safeHtml = renderedHtml ? sanitizeMarkup(renderedHtml) : '';

    return (
        <div className="space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/70 p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold uppercase tracking-wide text-orange-700">Concrete</p>
                <Badge className="bg-orange-100 text-orange-700 border border-orange-200/80">{spec.manipulative_type}</Badge>
            </div>

            {safeHtml ? (
                <div
                    className="rounded-xl border border-orange-100 bg-white p-3 text-sm text-slate-700 [&_p]:mb-2 [&_strong]:text-slate-800"
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
            ) : (
                <div className="rounded-xl border border-orange-100 bg-white p-3 text-sm text-slate-700 space-y-2">
                    <p>{spec.action_instruction}</p>
                    <p className="italic text-slate-600">{spec.result_prompt}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {spec.groups.map((group, index) => (
                    <span
                        key={`${group.label}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                        {group.label}: {group.count}
                    </span>
                ))}
            </div>
        </div>
    );
}
