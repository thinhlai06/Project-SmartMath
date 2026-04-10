import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type AnswerType = 'text' | 'number' | 'boolean' | 'ordered_list' | 'unordered_list' | 'multi_blank';
export type GradingRule = 'all_or_nothing' | 'per_item';

export interface AnswerBuilderEntry {
    id: string;
    answerType: AnswerType;
    answerValue: string;
    points: number;
    gradingRule: GradingRule;
}

interface AnswerBuilderProps {
    value: AnswerBuilderEntry[];
    onChange: (nextValue: AnswerBuilderEntry[]) => void;
}

const ANSWER_TYPE_LABEL: Record<AnswerType, string> = {
    text: 'Văn bản chính xác',
    number: 'Số',
    boolean: 'Đúng/Sai',
    ordered_list: 'Danh sách có thứ tự',
    unordered_list: 'Danh sách không thứ tự',
    multi_blank: 'Nhiều ô trống',
};

const isListLikeType = (answerType: AnswerType): boolean =>
    answerType === 'ordered_list' || answerType === 'unordered_list' || answerType === 'multi_blank';

const createDefaultEntry = (index: number): AnswerBuilderEntry => ({
    id: String(index),
    answerType: 'number',
    answerValue: '',
    points: 10,
    gradingRule: 'all_or_nothing',
});

const splitListItems = (rawValue: string): string[] => {
    if (!rawValue.trim()) {
        return [];
    }

    return rawValue
        .split(/[,;\n|]+/g)
        .map((item) => item.trim())
        .filter(Boolean);
};

const parseBoolean = (rawValue: string): boolean => rawValue === 'true';

export const toAnswerKeyPayload = (entries: AnswerBuilderEntry[]): Array<Record<string, unknown>> => {
    return entries.map((entry, index) => {
        const normalizedId = entry.id.trim() || String(index + 1);

        let answer: unknown = entry.answerValue.trim();
        if (entry.answerType === 'number') {
            const normalizedNumber = entry.answerValue.replace(',', '.').trim();
            const parsedNumber = Number(normalizedNumber);
            answer = Number.isFinite(parsedNumber) ? parsedNumber : entry.answerValue.trim();
        } else if (entry.answerType === 'boolean') {
            answer = parseBoolean(entry.answerValue);
        } else if (isListLikeType(entry.answerType)) {
            answer = splitListItems(entry.answerValue);
        }

        const payload: Record<string, unknown> = {
            id: normalizedId,
            answer,
            points: Math.max(1, Math.round(entry.points || 10)),
            answer_type: entry.answerType,
            question_type: entry.answerType,
        };

        if (isListLikeType(entry.answerType)) {
            payload.grading_rule = entry.gradingRule;
        }

        return payload;
    });
};

const getPlaceholder = (answerType: AnswerType): string => {
    if (answerType === 'number') {
        return 'Ví dụ: 12';
    }
    if (answerType === 'boolean') {
        return 'Chọn Đúng hoặc Sai';
    }
    if (answerType === 'ordered_list') {
        return 'Ví dụ: 2, 4, 6';
    }
    if (answerType === 'unordered_list') {
        return 'Ví dụ: tam giác; hình vuông; hình chữ nhật';
    }
    if (answerType === 'multi_blank') {
        return 'Ví dụ: 5, 8, 13';
    }
    return 'Ví dụ: 5 quả táo';
};

export function AnswerBuilder({ value, onChange }: AnswerBuilderProps) {
    const addEntry = () => {
        const nextEntry = createDefaultEntry(value.length + 1);
        onChange([...value, nextEntry]);
    };

    const removeEntry = (index: number) => {
        onChange(value.filter((_, itemIndex) => itemIndex !== index));
    };

    const updateEntry = (index: number, patch: Partial<AnswerBuilderEntry>) => {
        onChange(
            value.map((entry, itemIndex) => {
                if (itemIndex !== index) {
                    return entry;
                }
                return {
                    ...entry,
                    ...patch,
                };
            })
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-bold block text-base">3. Answer Builder (Tùy chọn)</Label>
                <Button type="button" size="sm" variant="outline" onClick={addEntry}>
                    <Plus className="h-4 w-4" />
                    Thêm câu
                </Button>
            </div>

            {value.length === 0 && (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600">
                    Để trống nếu muốn AI tự giải và chấm điểm. Khi cần chấm theo đáp án giáo viên, hãy thêm từng câu ở đây.
                </p>
            )}

            {value.map((entry, index) => (
                <div key={`${entry.id}-${index}`} className="rounded-xl border border-slate-200 bg-white/70 p-3 space-y-3">
                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                            <Label className="text-xs text-slate-600">Câu</Label>
                            <Input
                                value={entry.id}
                                onChange={(event) => updateEntry(index, { id: event.target.value })}
                                placeholder={`Câu ${index + 1}`}
                            />
                        </div>
                        <div className="col-span-5">
                            <Label className="text-xs text-slate-600">Kiểu đáp án</Label>
                            <select
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                                value={entry.answerType}
                                onChange={(event) => {
                                    const nextType = event.target.value as AnswerType;
                                    updateEntry(index, {
                                        answerType: nextType,
                                        answerValue: nextType === 'boolean' ? 'true' : entry.answerValue,
                                        gradingRule: isListLikeType(nextType) ? entry.gradingRule : 'all_or_nothing',
                                    });
                                }}
                            >
                                {Object.entries(ANSWER_TYPE_LABEL).map(([answerType, label]) => (
                                    <option key={answerType} value={answerType}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <Label className="text-xs text-slate-600">Điểm tối đa</Label>
                            <Input
                                type="number"
                                min={1}
                                value={entry.points}
                                onChange={(event) => updateEntry(index, { points: Number(event.target.value) || 1 })}
                            />
                        </div>
                        <div className="col-span-1 flex items-end justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEntry(index)}
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Xóa câu ${entry.id || index + 1}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-slate-600">Đáp án mong đợi</Label>
                        {entry.answerType === 'boolean' ? (
                            <select
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                                value={entry.answerValue || 'true'}
                                onChange={(event) => updateEntry(index, { answerValue: event.target.value })}
                            >
                                <option value="true">Đúng</option>
                                <option value="false">Sai</option>
                            </select>
                        ) : (
                            <Input
                                value={entry.answerValue}
                                onChange={(event) => updateEntry(index, { answerValue: event.target.value })}
                                placeholder={getPlaceholder(entry.answerType)}
                            />
                        )}
                    </div>

                    {isListLikeType(entry.answerType) && (
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <Label className="text-xs text-slate-600">Quy tắc chấm</Label>
                                <select
                                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                                    value={entry.gradingRule}
                                    onChange={(event) => updateEntry(index, { gradingRule: event.target.value as GradingRule })}
                                >
                                    <option value="all_or_nothing">All-or-nothing</option>
                                    <option value="per_item">Theo từng ý (per-item)</option>
                                </select>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Với dạng danh sách/nhiều ô trống, nhập các ý cách nhau bởi dấu phẩy, chấm phẩy hoặc xuống dòng.
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
