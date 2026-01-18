import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface Step2CPAGeneratorProps {
    data: { topicId: string, standard: string };
    onNext: (data: any) => void;
    onBack: () => void;
}

export function Step2CPAGenerator({ data, onNext, onBack }: Step2CPAGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(true);
    const [generatedContent, setGeneratedContent] = useState<any>(null);

    useEffect(() => {
        // Simulate AI generation
        const timer = setTimeout(() => {
            setGeneratedContent({
                concrete: "Sử dụng 5 que tính màu đỏ và 3 que tính màu xanh để minh họa phép cộng 5 + 3.",
                pictorial: "Vẽ 5 quả táo đỏ và 3 quả táo xanh vào hai rổ khác nhau.",
                abstract: "Viết phép tính: 5 + 3 = 8",
                practice: "Bài tập 1: Tính nhẩm 5 + 3\nBài tập 2: Điền số thích hợp vào ô trống: 5 + ... = 8"
            });
            setIsGenerating(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleRegenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
        }, 1500);
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
                {isGenerating ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-900">Đang tạo nội dung với AI...</h3>
                        <p className="text-gray-500">Đang phân tích mục tiêu: "{data.standard}"</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Concrete */}
                            <div className="space-y-3">
                                <Label className="text-orange-700 font-bold flex items-center gap-2">
                                    🔶 Concrete (Cụ thể)
                                </Label>
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 min-h-[150px]">
                                    <p className="text-gray-700 text-sm leading-relaxed">{generatedContent.concrete}</p>
                                </div>
                            </div>

                            {/* Pictorial */}
                            <div className="space-y-3">
                                <Label className="text-blue-700 font-bold flex items-center gap-2">
                                    🟦 Pictorial (Hình ảnh)
                                </Label>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 min-h-[150px]">
                                    <p className="text-gray-700 text-sm leading-relaxed">{generatedContent.pictorial}</p>
                                </div>
                            </div>

                            {/* Abstract */}
                            <div className="space-y-3">
                                <Label className="text-purple-700 font-bold flex items-center gap-2">
                                    🟣 Abstract (Trừu tượng)
                                </Label>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 min-h-[150px]">
                                    <p className="text-gray-700 text-sm leading-relaxed">{generatedContent.abstract}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold flex items-center gap-2">
                                📝 Bài tập thực hành
                            </Label>
                            <Textarea
                                className="min-h-[100px] border-gray-200 focus:ring-purple-500"
                                value={generatedContent.practice}
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
