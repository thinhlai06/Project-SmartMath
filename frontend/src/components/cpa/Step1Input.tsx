import { useState } from 'react';
import { MOCK_CPA_TOPICS } from '../../mockData/cpaTopics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ArrowRight, BookOpen } from 'lucide-react';

interface Step1InputProps {
    onNext: (data: { topicId: string, standard: string }) => void;
    initialData?: { topicId: string, standard: string };
}

export function Step1Input({ onNext, initialData }: Step1InputProps) {
    const [selectedGrade, setSelectedGrade] = useState<string>(initialData?.topicId ? MOCK_CPA_TOPICS.find(t => t.id === initialData.topicId)?.grade.toString() || '1' : '1');
    const [selectedTopicId, setSelectedTopicId] = useState<string>(initialData?.topicId || '');
    const [selectedStandard, setSelectedStandard] = useState<string>(initialData?.standard || '');

    const filteredTopics = MOCK_CPA_TOPICS.filter(t => t.grade.toString() === selectedGrade);
    const selectedTopic = MOCK_CPA_TOPICS.find(t => t.id === selectedTopicId);

    const handleNext = () => {
        if (selectedTopicId && selectedStandard) {
            onNext({ topicId: selectedTopicId, standard: selectedStandard });
        }
    };

    return (
        <Card className="max-w-3xl mx-auto shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-50">
                <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Chọn chủ đề & mục tiêu
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Grade Selection */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Khối lớp</Label>
                    <div className="flex gap-4">
                        {['1', '2', '3'].map((grade) => (
                            <Button
                                key={grade}
                                type="button"
                                variant={selectedGrade === grade ? 'default' : 'outline'}
                                onClick={() => {
                                    setSelectedGrade(grade);
                                    setSelectedTopicId('');
                                    setSelectedStandard('');
                                }}
                                className={`w-24 h-12 text-lg ${selectedGrade === grade ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200'}`}
                            >
                                Lớp {grade}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Topic Selection */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Chủ đề Toán học</Label>
                    <Select value={selectedTopicId} onValueChange={(val) => {
                        setSelectedTopicId(val);
                        setSelectedStandard('');
                    }}>
                        <SelectTrigger className="h-12 border-gray-200 bg-white">
                            <SelectValue placeholder="Chọn chủ đề bài học..." />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredTopics.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id}>
                                    {topic.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Standard Selection */}
                {selectedTopic && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            Mục tiêu cần đạt (YCCĐ)
                        </Label>
                        <RadioGroup value={selectedStandard} onValueChange={setSelectedStandard} className="gap-3">
                            {selectedTopic.standards.map((std, idx) => (
                                <div key={idx} className={`flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedStandard === std ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                                    <RadioGroupItem value={std} id={`std-${idx}`} className="mt-1" />
                                    <Label htmlFor={`std-${idx}`} className="text-gray-700 font-normal cursor-pointer leading-relaxed">
                                        {std}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleNext}
                        disabled={!selectedTopicId || !selectedStandard}
                        className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Tiếp tục <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
