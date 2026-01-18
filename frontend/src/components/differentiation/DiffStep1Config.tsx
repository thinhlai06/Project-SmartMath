import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowRight, Layers, Loader2 } from 'lucide-react';

interface Topic {
    id: number;
    topic_name: string;
    category: string;
    grade: number;
}

interface DiffStep1ConfigProps {
    onNext: (data: { topicId: string, strategy: string, grade: number }) => void;
    initialData?: { topicId: string, strategy: string };
}

export function DiffStep1Config({ onNext, initialData }: DiffStep1ConfigProps) {
    const [selectedGrade, setSelectedGrade] = useState<string>('1');
    const [selectedTopicId, setSelectedTopicId] = useState<string>(initialData?.topicId || '');
    const [selectedStrategy, setSelectedStrategy] = useState<string>(initialData?.strategy || 'tiered');
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

    const handleNext = () => {
        if (selectedTopicId && selectedStrategy) {
            onNext({
                topicId: selectedTopicId,
                strategy: selectedStrategy,
                grade: parseInt(selectedGrade)
            });
        }
    };

    return (
        <Card className="max-w-3xl mx-auto shadow-lg border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50">
                <CardTitle className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Cấu hình Phân hóa
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
                                }}
                                className={`w-24 h-12 text-lg ${selectedGrade === grade ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-gray-200'}`}
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
                            <button onClick={fetchTopics} className="ml-2 text-indigo-600 underline">Thử lại</button>
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="text-gray-500 text-sm">Chưa có chủ đề nào cho lớp {selectedGrade}</div>
                    ) : (
                        <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
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

                {/* Strategy Selection */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        Chiến lược phân hóa
                    </Label>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStrategy === 'tiered' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300'}`}
                            onClick={() => setSelectedStrategy('tiered')}
                        >
                            <h3 className="font-bold text-indigo-900 mb-1">Phân hóa theo năng lực (Tiered)</h3>
                            <p className="text-sm text-gray-600">Chia bài tập thành 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.</p>
                        </div>
                        <div
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStrategy === 'scaffold' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300'}`}
                            onClick={() => setSelectedStrategy('scaffold')}
                        >
                            <h3 className="font-bold text-gray-400 mb-1">Phân hóa hỗ trợ (Scaffolding)</h3>
                            <p className="text-sm text-gray-400">Cung cấp gợi ý và khung hỗ trợ khác nhau cho cùng một bài toán. (Sắp ra mắt)</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleNext}
                        disabled={!selectedTopicId || selectedStrategy !== 'tiered'}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Tiếp tục <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
