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
    lockedGrade?: number;
}

export function DiffStep1Config({ onNext, initialData, lockedGrade }: DiffStep1ConfigProps) {
    const [selectedGrade, setSelectedGrade] = useState<string>(lockedGrade ? String(lockedGrade) : '1');
    const [selectedTopicId, setSelectedTopicId] = useState<string>(initialData?.topicId || '');
    const [selectedStrategy, setSelectedStrategy] = useState<string>(initialData?.strategy || 'tiered');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/topics?grade=${selectedGrade}`, {
                credentials: 'include'
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

    useEffect(() => {
        if (!lockedGrade) {
            return;
        }

        setSelectedGrade(String(lockedGrade));
        setSelectedTopicId('');
    }, [lockedGrade]);

    const handleNext = () => {
        if (selectedTopicId && selectedStrategy) {
            onNext({
                topicId: selectedTopicId,
                strategy: selectedStrategy,
                grade: lockedGrade ?? parseInt(selectedGrade)
            });
        }
    };

    return (
        <Card className="max-w-3xl mx-auto glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
            <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm">
                        <span className="font-extrabold">1</span>
                    </div>
                    Cấu hình Phân hóa
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {/* Grade Selection */}
                <div className="space-y-4">
                    <Label className="text-base font-bold text-slate-800">Khối lớp</Label>
                    {lockedGrade && (
                        <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                            Đang khóa theo lớp đã chọn: Lớp {lockedGrade}
                        </p>
                    )}
                    <div className="flex gap-4">
                        {['1', '2', '3'].map((grade) => (
                            <Button
                                key={grade}
                                type="button"
                                variant={selectedGrade === grade ? 'default' : 'outline'}
                                onClick={() => {
                                    if (lockedGrade) {
                                        return;
                                    }
                                    setSelectedGrade(grade);
                                    setSelectedTopicId('');
                                }}
                                disabled={Boolean(lockedGrade && Number(grade) !== lockedGrade)}
                                className={`w-24 h-12 text-base font-bold rounded-xl transition-all ${selectedGrade === grade ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'border-slate-200 bg-white/60 hover:bg-slate-50 text-slate-600'} disabled:opacity-40`}
                            >
                                Lớp {grade}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Topic Selection */}
                <div className="space-y-4">
                    <Label className="text-base font-bold text-slate-800">Chủ đề Toán học</Label>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                            Đang tải chủ đề...
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                            <span>⚠️</span> {error}
                            <button onClick={fetchTopics} className="ml-auto text-indigo-600 hover:text-indigo-700 underline font-semibold">Thử lại</button>
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="text-slate-500 text-sm font-medium bg-slate-100/50 p-3 rounded-xl border border-slate-200">Chưa có chủ đề nào cho lớp {selectedGrade}</div>
                    ) : (
                        <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white/80 rounded-xl font-medium text-slate-700 focus:ring-indigo-500/20 shadow-sm">
                                <SelectValue placeholder="Chọn chủ đề bài học..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                                {topics.map((topic) => (
                                    <SelectItem key={topic.id} value={topic.id.toString()} className="focus:bg-indigo-50 focus:text-indigo-900 rounded-lg cursor-pointer">
                                        <span className="font-medium text-slate-700">{topic.topic_name}</span> <span className="text-slate-400 text-xs ml-2">({topic.category})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Strategy Selection */}
                <div className="space-y-4">
                    <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        Chiến lược phân hóa
                    </Label>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div
                            className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden ${selectedStrategy === 'tiered' ? 'border-2 border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.02]' : 'border-2 border-slate-200 bg-white/60 hover:border-indigo-300 hover:bg-white shadow-sm'}`}
                            onClick={() => setSelectedStrategy('tiered')}
                        >
                            {selectedStrategy === 'tiered' && (
                                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-indigo-500"></div>
                            )}
                            <h3 className={`font-bold mb-2 ${selectedStrategy === 'tiered' ? 'text-indigo-900' : 'text-slate-700'}`}>Phân hóa theo năng lực (Tiered)</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Chia bài tập thành 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.</p>
                        </div>
                        <div
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedStrategy === 'scaffold' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed'}`}
                            onClick={() => { /* setSelectedStrategy('scaffold') */ }}
                        >
                            <h3 className="font-bold text-slate-400 mb-2">Phân hóa hỗ trợ (Scaffolding)</h3>
                            <p className="text-sm text-slate-400/80 font-medium leading-relaxed">Cung cấp gợi ý và khung hỗ trợ khác nhau cho cùng một bài toán. (Sắp ra mắt)</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button
                        onClick={handleNext}
                        disabled={!selectedTopicId || selectedStrategy !== 'tiered'}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all btn-bounce disabled:opacity-50 disabled:shadow-none"
                    >
                        Tiếp tục <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
