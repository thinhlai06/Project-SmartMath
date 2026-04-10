import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { DIFF_TIERS } from './tierConfig';

interface QuestionItem {
    question: string;
    answer: string;
    hint?: string;
}

interface DiffStep3ContentProps {
    assignments: Record<string, string[]>;
    data: {
        topicId: string;
        strategy: string;
        grade: number;
    };
    onBack: () => void;
    onSave: () => void;
    isSaving?: boolean;
}

export function DiffStep3Content({ assignments, data, onBack, onSave, isSaving = false }: DiffStep3ContentProps) {
    const [isGenerating, setIsGenerating] = useState(true);
    const [content, setContent] = useState<Record<string, QuestionItem[]>>({});
    const [error, setError] = useState<string | null>(null);

    const generateContent = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await fetch('/api/ai/generate-differentiation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    topic_id: parseInt(data.topicId),
                    grade: data.grade || 1,
                    objective: `Chiến lược: ${data.strategy}`,
                    tiers: DIFF_TIERS.map(t => t.id)
                })
            });

            if (!response.ok) {
                throw new Error('Không thể tạo nội dung phân hóa');
            }

            const result = await response.json();
            setContent(result.content);

        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối AI');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        generateContent();
    }, []);

    return (
        <Card className="max-w-4xl mx-auto glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
            <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm">
                        <span className="font-extrabold">3</span>
                    </div>
                    Nội dung phân hóa <span className="text-sm font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md ml-2 flex items-center gap-1 border border-indigo-100">✨ AI Generated</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                {error ? (
                    <div className="py-12 text-center space-y-5 animate-in fade-in duration-300">
                        <Alert variant="destructive" className="max-w-md mx-auto bg-red-50/90 border-red-200 text-red-700 shadow-sm rounded-2xl">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDescription className="font-medium">{error}</AlertDescription>
                        </Alert>
                        <Button onClick={generateContent} variant="outline" className="rounded-xl border-slate-200 shadow-sm font-semibold hover:bg-slate-50 text-slate-700">
                            <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                        </Button>
                    </div>
                ) : isGenerating ? (
                    <div className="py-24 text-center animate-in fade-in duration-500">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-70"></div>
                            <div className="relative w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center border border-indigo-50 z-10">
                                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Đang thiết kế bài tập</h3>
                        <p className="text-slate-500 font-medium">Bằng AI sáng tạo cho từng nhóm năng lực...</p>
                    </div>
                ) : (
                    <>
                        <Tabs defaultValue="standard" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100/50 p-1 rounded-2xl">
                                {DIFF_TIERS.map(tier => (
                                    <TabsTrigger 
                                        key={tier.id} 
                                        value={tier.id} 
                                        className={`rounded-xl font-bold transition-all data-[state=active]:shadow-sm data-[state=active]:scale-[1.02] ${
                                            tier.id === 'foundation' ? 'data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-emerald-700 hover:bg-emerald-50' :
                                            tier.id === 'standard' ? 'data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-700 hover:bg-blue-50' :
                                            tier.id === 'extension' ? 'data-[state=active]:bg-amber-500 data-[state=active]:text-white text-amber-700 hover:bg-amber-50' :
                                            'data-[state=active]:bg-rose-500 data-[state=active]:text-white text-rose-700 hover:bg-rose-50'
                                        }`}
                                    >
                                        <span className="hidden md:inline">{tier.name}</span>
                                        <span className="md:hidden">{tier.name.split(' ')[0]}</span>
                                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs bg-white/30 backdrop-blur-sm`}>
                                            {assignments[tier.id]?.length || 0}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {DIFF_TIERS.map(tier => (
                                <TabsContent key={tier.id} value={tier.id} className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300 m-0">
                                    <div className={`p-6 rounded-2xl bg-white/60 border shadow-sm backdrop-blur-sm ${
                                        tier.id === 'foundation' ? 'border-emerald-200/60' :
                                        tier.id === 'standard' ? 'border-blue-200/60' :
                                        tier.id === 'extension' ? 'border-amber-200/60' : 'border-rose-200/60'
                                    }`}>
                                        <div className="mb-6">
                                            <h3 className={`font-bold text-xl mb-2 flex items-center gap-2 ${
                                                tier.id === 'foundation' ? 'text-emerald-700' :
                                                tier.id === 'standard' ? 'text-blue-700' :
                                                tier.id === 'extension' ? 'text-amber-700' : 'text-rose-700'
                                            }`}>
                                                {tier.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium">{tier.description}</p>
                                        </div>

                                        <div className="space-y-4">
                                            {content[tier.id]?.map((item, idx) => (
                                                <div key={idx} className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-md ${
                                                    tier.id === 'foundation' ? 'border-emerald-100/50 hover:border-emerald-300' :
                                                    tier.id === 'standard' ? 'border-blue-100/50 hover:border-blue-300' :
                                                    tier.id === 'extension' ? 'border-amber-100/50 hover:border-amber-300' : 
                                                    'border-rose-100/50 hover:border-rose-300'
                                                }`}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">Câu {idx + 1}</span>
                                                    </div>
                                                    <p className="text-slate-800 text-base mb-4 font-medium leading-relaxed">{item.question}</p>
                                                    <div className="bg-slate-50/80 p-3 rounded-xl text-sm text-slate-600 border border-slate-100 font-medium">
                                                        <strong className="text-slate-800 mr-2">Đáp án:</strong> {item.answer}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!content[tier.id] || content[tier.id].length === 0) && (
                                                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                                    <p className="text-slate-400 font-medium">Chưa có nội dung cho nhóm này.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>

                        <div className="pt-8 flex justify-between items-center border-t border-slate-100 mt-8">
                            <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 border-slate-200 font-semibold h-11 px-6" disabled={isSaving}>
                                <ArrowLeft className="w-4 h-4" /> Quay lại
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold h-11 px-8 rounded-xl shadow-md hover:shadow-lg transition-all btn-bounce"
                            >
                                {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4" /> Hoàn tất & Lưu</>}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

