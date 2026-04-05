import { Badge } from '@/components/ui/badge';
import type { PictorialSpec } from '@/types/cpaBundle';

interface PictorialDisplayProps {
    spec: PictorialSpec;
    renderedSvg?: string;
}

const sanitizeMarkup = (markup: string): string => {
    return markup
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/\son\w+=\"[^\"]*\"/gi, '')
        .replace(/\son\w+='[^']*'/gi, '');
};

export function PictorialDisplay({ spec, renderedSvg }: PictorialDisplayProps) {
    const safeSvg = renderedSvg ? sanitizeMarkup(renderedSvg) : '';

    return (
        <div className="space-y-3 rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold uppercase tracking-wide text-sky-700">Pictorial</p>
                <Badge className="bg-sky-100 text-sky-700 border border-sky-200/80">{spec.diagram_type}</Badge>
            </div>

            <p className="rounded-xl border border-sky-100 bg-white p-3 text-sm text-slate-700">{spec.question_text}</p>

            {safeSvg ? (
                <div
                    className="overflow-x-auto rounded-xl border border-sky-100 bg-white p-3 [&_svg]:mx-auto"
                    dangerouslySetInnerHTML={{ __html: safeSvg }}
                />
            ) : (
                <div className="rounded-xl border border-sky-100 bg-white p-3 text-xs text-slate-600">
                    Chua co hinh ve tu he thong render.
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {spec.groups.map((group, index) => (
                    <span
                        key={`${group.shape}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                        {group.shape}: {group.count}
                    </span>
                ))}
            </div>
        </div>
    );
}
