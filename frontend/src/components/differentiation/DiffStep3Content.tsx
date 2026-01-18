import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { MOCK_TIERS } from '../../mockData/differentiationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';

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
            const response = await fetch('http://localhost:8000/api/ai/generate-differentiation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic_id: parseInt(data.topicId),
                    grade: data.grade || 1,
                    objective: `Chiến lược: ${data.strategy}`,
                    tiers: MOCK_TIERS.map(t => t.id)
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
        <Card className="max-w-4xl mx-auto shadow-lg border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50">
                <CardTitle className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Nội dung phân hóa (AI Generated)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error ? (
                    <div className="py-10 text-center space-y-4">
                        <Alert variant="destructive" className="max-w-md mx-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button onClick={generateContent} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                        </Button>
                    </div>
                ) : isGenerating ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900">Đang tạo nội dung phân hóa...</h3>
                        <p className="text-gray-500">AI đang thiết kế bài tập cho từng nhóm năng lực</p>
                    </div>
                ) : (
                    <>
                        <Tabs defaultValue="standard" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6">
                                {MOCK_TIERS.map(tier => (
                                    <TabsTrigger key={tier.id} value={tier.id} className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800">
                                        {tier.name.split(' ')[0]} ({assignments[tier.id]?.length || 0})
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {MOCK_TIERS.map(tier => (
                                <TabsContent key={tier.id} value={tier.id} className="space-y-4 animate-in fade-in-50">
                                    <div className={`p-4 rounded-lg bg-gray-50 border ${tier.color.replace('text-', 'border-').split(' ')[2] || 'border-gray-200'}`}>
                                        <h3 className={`font-bold text-lg mb-2 ${tier.color.split(' ')[1]}`}>{tier.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{tier.description}</p>

                                        <div className="space-y-3">
                                            {content[tier.id]?.map((item, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-semibold text-gray-700">Câu {idx + 1}</span>
                                                    </div>
                                                    <p className="text-gray-800 text-sm mb-2">{item.question}</p>
                                                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-500">
                                                        <strong>Đáp án:</strong> {item.answer}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!content[tier.id] || content[tier.id].length === 0) && (
                                                <p className="text-gray-400 italic text-center">Không có nội dung cho nhóm này.</p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>

                        <div className="pt-6 flex justify-between items-center border-t border-gray-100 mt-6">
                            <Button variant="outline" onClick={onBack} className="gap-2" disabled={isSaving}>
                                <ArrowLeft className="w-4 h-4" /> Quay lại
                            </Button>
                            <Button
                                onClick={onSave} // Note: This doesn't strictly pass the generated content back yet, as onSave in Wizard creates generic placeholders. Updated later if needed.
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md hover:shadow-lg"
                            >
                                <Save className="w-4 h-4" /> Hoàn tất & Lưu
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

