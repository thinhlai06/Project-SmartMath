import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';

interface Step2CPAGeneratorProps {
    data: {
        topicId: string,
        standard: string,
        grade: number // Added grade to props if available, otherwise defaulting to 1
    };
    onNext: (data: any) => void;
    onBack: () => void;
}

interface QuestionItem {
    question: string;
    answer: string;
    hint?: string;
}

interface CPAGenerationResponse {
    concrete: QuestionItem[];
    pictorial: QuestionItem[];
    abstract: QuestionItem[];
    rag_sources?: string[];
}

export function Step2CPAGenerator({ data, onNext, onBack }: Step2CPAGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(true);
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const formatQuestions = (items: QuestionItem[]) => {
        return items.map((item, i) =>
            `Câu ${i + 1}: ${item.question}\n(Đáp án: ${item.answer})`
        ).join('\n\n');
    };

    const generateAI = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/ai/generate-cpa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic_id: parseInt(data.topicId),
                    grade: data.grade || 1, // Default to grade 1 if not provided
                    objective: data.standard,
                    counts: { concrete: 2, pictorial: 2, abstract: 2 }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate content');
            }

            const result: CPAGenerationResponse = await response.json();

            setGeneratedContent({
                concrete: formatQuestions(result.concrete),
                pictorial: formatQuestions(result.pictorial),
                abstract: formatQuestions(result.abstract),
                practice: formatQuestions([...result.abstract]), // Use abstract for practice for now
                full_json: result // Keep raw data
            });

        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi kết nối AI');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        generateAI();
    }, []);

    const handleRegenerate = () => {
        generateAI();
    };

    return (
        <Card className="max-w-4xl mx-auto shadow-lg border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-50">
                <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Thiết kế bài tập CPA (AI Generated)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error ? (
                    <div className="py-10 text-center space-y-4">
                        <Alert variant="destructive" className="max-w-md mx-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button onClick={handleRegenerate} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                        </Button>
                    </div>
                ) : isGenerating ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900">Đang tạo nội dung với AI...</h3>
                        <p className="text-gray-500">Đang phân tích SGK và tạo câu hỏi cho: "{data.standard}"</p>
                        <p className="text-xs text-gray-400 mt-2">(Mất khoảng 10-30 giây)</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Concrete */}
                            <div className="space-y-3">
                                <Label className="text-orange-700 font-bold flex items-center gap-2">
                                    🔶 Concrete (Cụ thể)
                                </Label>
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 min-h-[150px] whitespace-pre-wrap text-sm">
                                    {generatedContent?.concrete}
                                </div>
                            </div>

                            {/* Pictorial */}
                            <div className="space-y-3">
                                <Label className="text-blue-700 font-bold flex items-center gap-2">
                                    🟦 Pictorial (Hình ảnh)
                                </Label>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 min-h-[150px] whitespace-pre-wrap text-sm">
                                    {generatedContent?.pictorial}
                                </div>
                            </div>

                            {/* Abstract */}
                            <div className="space-y-3">
                                <Label className="text-purple-700 font-bold flex items-center gap-2">
                                    🟣 Abstract (Trừu tượng)
                                </Label>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 min-h-[150px] whitespace-pre-wrap text-sm">
                                    {generatedContent?.abstract}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold flex items-center gap-2">
                                📝 Bài tập thực hành
                            </Label>
                            <Textarea
                                className="min-h-[100px] border-gray-200 focus:ring-purple-500"
                                value={generatedContent?.practice}
                                onChange={(e) => setGeneratedContent({ ...generatedContent, practice: e.target.value })}
                            />
                        </div>

                        <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                            <Button variant="outline" onClick={onBack} className="gap-2">
                                <ArrowLeft className="w-4 h-4" /> Quay lại
                            </Button>

                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={handleRegenerate} className="text-purple-600 hover:bg-purple-50">
                                    <RefreshCw className="w-4 h-4 mr-2" /> Tạo lại
                                </Button>
                                <Button onClick={() => onNext(generatedContent)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                                    Tiếp tục <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
