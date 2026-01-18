import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';

interface Topic {
    id: number;
    topic_name: string;
    category: string;
    grade: number;
    learning_standards?: string[];
}

// Default standards for when API doesn't provide them
const DEFAULT_STANDARDS: Record<string, string[]> = {
    'Số học': [
        'Thực hiện được các phép tính cơ bản',
        'Vận dụng kiến thức để giải quyết bài toán có lời văn',
        'Nhận biết và sử dụng các quan hệ số học'
    ],
    'Hình học': [
        'Nhận biết và mô tả các hình học cơ bản',
        'Tính được chu vi và diện tích các hình',
        'Vận dụng kiến thức hình học vào thực tế'
    ],
    'Đo lường': [
        'Sử dụng đúng các đơn vị đo',
        'Thực hiện được việc đổi đơn vị',
        'Ước lượng được độ dài, khối lượng phù hợp'
    ],
    'Giải toán': [
        'Phân tích được đề bài',
        'Lập được kế hoạch giải',
        'Trình bày được lời giải rõ ràng'
    ]
};

interface Step1InputProps {
    onNext: (data: { topicId: string, standard: string }) => void;
    initialData?: { topicId: string, standard: string };
}

export function Step1Input({ onNext, initialData }: Step1InputProps) {
    const [selectedGrade, setSelectedGrade] = useState<string>('1');
    const [selectedTopicId, setSelectedTopicId] = useState<string>(initialData?.topicId || '');
    const [selectedStandard, setSelectedStandard] = useState<string>(initialData?.standard || '');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/topics?grade=${selectedGrade}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTopics(data);
            } else {
                setError('Không thể tải danh sách chủ đề');
            }
        } catch {
            setError('Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    }, [selectedGrade]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    const selectedTopic = topics.find(t => t.id.toString() === selectedTopicId);

    // Get standards from topic or use defaults based on category
    const getStandardsForTopic = (topic: Topic | undefined): string[] => {
        if (!topic) return [];
        if (topic.learning_standards && topic.learning_standards.length > 0) {
            return topic.learning_standards;
        }
        // Fall back to category-based defaults
        return DEFAULT_STANDARDS[topic.category] || DEFAULT_STANDARDS['Số học'];
    };

    const standards = getStandardsForTopic(selectedTopic);

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
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải chủ đề...
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-sm">
                            {error}
                            <button onClick={fetchTopics} className="ml-2 text-blue-600 underline">Thử lại</button>
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="text-gray-500 text-sm">Chưa có chủ đề nào cho lớp {selectedGrade}</div>
                    ) : (
                        <Select value={selectedTopicId} onValueChange={(val) => {
                            setSelectedTopicId(val);
                            setSelectedStandard('');
                        }}>
                            <SelectTrigger className="h-12 border-gray-200 bg-white">
                                <SelectValue placeholder="Chọn chủ đề bài học..." />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map((topic) => (
                                    <SelectItem key={topic.id} value={topic.id.toString()}>
                                        {topic.topic_name} ({topic.category})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Standard Selection */}
                {selectedTopic && standards.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            Mục tiêu cần đạt (YCCĐ)
                        </Label>
                        <RadioGroup value={selectedStandard} onValueChange={setSelectedStandard} className="gap-3">
                            {standards.map((std, idx) => (
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
