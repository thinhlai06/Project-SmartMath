import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { MOCK_TIERS } from '../../mockData/differentiationData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface DiffStep3ContentProps {
    assignments: Record<string, string[]>;
    onBack: () => void;
    onSave: () => void;
}

export function DiffStep3Content({ assignments, onBack, onSave }: DiffStep3ContentProps) {
    return (
        <Card className="max-w-4xl mx-auto shadow-lg border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50">
                <CardTitle className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Nội dung phân hóa
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-700">Bài 1 (Trắc nghiệm)</span>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">2 điểm</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">Nội dung câu hỏi sẽ được AI sinh tự động dựa trên mức độ khó tương ứng...</p>
                                    </div>
                                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-700">Bài 2 (Tự luận)</span>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">8 điểm</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">Nội dung câu hỏi tự luận phù hợp với năng lực học sinh...</p>
                                    </div>

                                    <div className="flex justify-center py-4">
                                        <Button variant="ghost" className="text-indigo-600">
                                            <FileText className="w-4 h-4 mr-2" /> Xem chi tiết đề bài
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                <div className="pt-6 flex justify-between items-center border-t border-gray-100 mt-6">
                    <Button variant="outline" onClick={onBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Button>
                    <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md hover:shadow-lg">
                        <Save className="w-4 h-4" /> Hoàn tất & Lưu
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
