import { useMemo, useState } from 'react';
import { CheckCircle2, CircleDashed, PencilLine, ShieldAlert, ShieldCheck, ShieldX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import type { CPABundle } from '@/types/cpaBundle';
import { AbstractDisplay } from './AbstractDisplay';
import { ConcreteDisplay } from './ConcreteDisplay';
import { PictorialDisplay } from './PictorialDisplay';

export type BundleReviewStatus = 'pending' | 'approved' | 'rejected';

interface CPABundleCardProps {
    bundle: CPABundle;
    index: number;
    reviewStatus: BundleReviewStatus;
    isDirty: boolean;
    onStatusChange: (next: BundleReviewStatus) => void;
    onBundleChange: (nextBundle: CPABundle) => void;
}

const validationClassMap: Record<CPABundle['validation_status'], string> = {
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    passed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    failed: 'bg-rose-100 text-rose-700 border-rose-200',
};

const reviewClassMap: Record<BundleReviewStatus, string> = {
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

export function CPABundleCard({
    bundle,
    index,
    reviewStatus,
    isDirty,
    onStatusChange,
    onBundleChange,
}: CPABundleCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    const summary = useMemo(() => {
        const family = bundle.content_family || 'arithmetic';

        if (family === 'geometry') {
            const targetShape = bundle.family_payload?.target_shape || 'hinh hoc';
            const task = bundle.family_payload?.task || 'identify';
            return `Geometry core: ${task} / ${targetShape}`;
        }

        if (family === 'measurement') {
            const quantityType = bundle.family_payload?.quantity_type || 'do luong';
            const unit = bundle.family_payload?.unit || '';
            return `Measurement core: ${quantityType} (${unit})`;
        }

        if (!bundle.math_core) {
            return `Core: ${family}`;
        }

        if (bundle.math_core.common.operation_family === 'division_with_remainder') {
            return `${bundle.math_core.specific.dividend} : ${bundle.math_core.specific.divisor} = ${bundle.math_core.specific.quotient} du ${bundle.math_core.specific.remainder}`;
        }

        const symbolMap = {
            addition: '+',
            subtraction: '-',
            multiplication: 'x',
            division_with_remainder: ':',
        } as const;
        const symbol = symbolMap[bundle.math_core.common.operation_family];
        return `${bundle.math_core.specific.operand_a} ${symbol} ${bundle.math_core.specific.operand_b} = ${bundle.math_core.specific.result}`;
    }, [bundle]);

    const setAnswer = (nextAnswer: string) => {
        onBundleChange({
            ...bundle,
            concrete: { ...bundle.concrete, answer: nextAnswer },
            pictorial: { ...bundle.pictorial, answer: nextAnswer },
            abstract: { ...bundle.abstract, answer: nextAnswer },
            validation_status: 'pending',
        });
    };

    const validatorIcon =
        bundle.validation_status === 'passed' ? (
            <ShieldCheck className="h-4 w-4" />
        ) : bundle.validation_status === 'failed' ? (
            <ShieldX className="h-4 w-4" />
        ) : (
            <ShieldAlert className="h-4 w-4" />
        );

    return (
        <Card className="overflow-hidden rounded-3xl border-slate-200/80 shadow-soft">
            <CardHeader className="bg-white/70 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-lg font-bold text-slate-800">Bundle {index + 1}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={validationClassMap[bundle.validation_status]}>
                            <span className="mr-1">{validatorIcon}</span>
                            Validate: {bundle.validation_status}
                        </Badge>
                        <Badge className={reviewClassMap[reviewStatus]}>Review: {reviewStatus}</Badge>
                        {isDirty && <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">Da chinh sua</Badge>}
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-600">Math core: {summary}</p>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
                {bundle.validator_messages.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 space-y-1">
                        {bundle.validator_messages.map((item) => (
                            <p key={`${item.code}-${item.message}`} className="text-xs text-amber-800">
                                [{item.severity}] {item.message}
                            </p>
                        ))}
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-3">
                    <ConcreteDisplay spec={bundle.concrete} renderedHtml={bundle.rendered?.concrete_html} />
                    <PictorialDisplay spec={bundle.pictorial} renderedSvg={bundle.rendered?.pictorial_svg} />
                    <AbstractDisplay spec={bundle.abstract} renderedLatex={bundle.rendered?.abstract_latex} />
                </div>

                {isEditing && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                        <p className="text-sm font-bold text-slate-700">Chinh sua nhanh noi dung bundle</p>

                        <Textarea
                            value={bundle.concrete.action_instruction}
                            onChange={(event) =>
                                onBundleChange({
                                    ...bundle,
                                    concrete: { ...bundle.concrete, action_instruction: event.target.value },
                                    validation_status: 'pending',
                                })
                            }
                            placeholder="Huong dan thao tac vat that"
                            className="bg-white min-h-[70px]"
                        />

                        <Textarea
                            value={bundle.pictorial.question_text}
                            onChange={(event) =>
                                onBundleChange({
                                    ...bundle,
                                    pictorial: { ...bundle.pictorial, question_text: event.target.value },
                                    validation_status: 'pending',
                                })
                            }
                            placeholder="Cau hoi cho lop pictorial"
                            className="bg-white min-h-[70px]"
                        />

                        <Textarea
                            value={bundle.abstract.expression}
                            onChange={(event) =>
                                onBundleChange({
                                    ...bundle,
                                    abstract: { ...bundle.abstract, expression: event.target.value },
                                    validation_status: 'pending',
                                })
                            }
                            placeholder="Bieu thuc abstract"
                            className="bg-white min-h-[70px]"
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                            <Textarea
                                value={bundle.abstract.answer}
                                onChange={(event) => setAnswer(event.target.value)}
                                placeholder="Dap an chuan"
                                className="bg-white min-h-[65px]"
                            />
                            <Textarea
                                value={bundle.abstract.hint || ''}
                                onChange={(event) =>
                                    onBundleChange({
                                        ...bundle,
                                        abstract: { ...bundle.abstract, hint: event.target.value },
                                        validation_status: 'pending',
                                    })
                                }
                                placeholder="Goi y ngan gon"
                                className="bg-white min-h-[65px]"
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={reviewStatus === 'approved' ? 'default' : 'outline'}
                            onClick={() => onStatusChange('approved')}
                            className={reviewStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                        >
                            <CheckCircle2 className="h-4 w-4" /> Duyet
                        </Button>
                        <Button
                            type="button"
                            variant={reviewStatus === 'rejected' ? 'destructive' : 'outline'}
                            onClick={() => onStatusChange('rejected')}
                        >
                            <Trash2 className="h-4 w-4" /> Tu choi
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onStatusChange('pending')}>
                            <CircleDashed className="h-4 w-4" /> Cho xu ly
                        </Button>
                    </div>

                    <Button type="button" variant="outline" onClick={() => setIsEditing((prev) => !prev)}>
                        <PencilLine className="h-4 w-4" />
                        {isEditing ? 'Dong chinh sua' : 'Chinh sua'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
