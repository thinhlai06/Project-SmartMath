import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lightbulb, CheckCircle2 } from 'lucide-react';

interface ParentExercise {
    id: number;
    worksheet_id: number;
    question: string;
    answer: string | null;
    hint: string | null;
    exercise_type: string | null;
    difficulty_tier: string | null;
    order_index: number;
}

export default function ParentSolutionsPage() {
    const { worksheetId } = useParams<{ worksheetId: string }>();
    const [exercises, setExercises] = useState<ParentExercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExercises = async () => {
            if (!worksheetId) {
                setError('Thiếu mã bài tập.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/parent/worksheets/${worksheetId}/exercises`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.detail || 'Không thể tải dữ liệu bài tập.');
                }

                const data = await response.json();
                setExercises(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu bài tập.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExercises();
    }, [worksheetId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans py-8">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="mb-6 flex items-center gap-3">
                    <Link to="/parent" className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-white hover:text-indigo-600 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang phụ huynh
                    </Link>
                </div>

                <div className="glass-panel bg-amber-50/80 border-amber-200 rounded-3xl p-5 mb-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-800 text-lg">Lời giải và đáp án thực tế từ bài đã giao</h3>
                            <p className="text-sm font-medium text-amber-700 mt-1">
                                Dữ liệu dưới đây được lấy trực tiếp từ bài tập đã xuất bản của giáo viên.
                            </p>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="glass-panel rounded-3xl p-8 bg-rose-50 border border-rose-200">
                        <h2 className="text-xl font-bold text-rose-700 mb-2">Không tải được dữ liệu</h2>
                        <p className="text-rose-600">{error}</p>
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-8 bg-white/80 border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa có câu hỏi</h2>
                        <p className="text-slate-600">Bài tập này chưa có dữ liệu câu hỏi hoặc chưa được giáo viên cập nhật đáp án.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {exercises.map((exercise, index) => (
                            <div key={exercise.id} className="glass-panel rounded-3xl p-6 bg-white/80 border border-slate-200/70 shadow-sm">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Câu {index + 1}</p>
                                <p className="text-slate-800 font-semibold text-lg leading-relaxed mb-4">{exercise.question}</p>

                                {exercise.hint && (
                                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                                        <p className="text-amber-800 text-sm font-medium">Gợi ý: {exercise.hint}</p>
                                    </div>
                                )}

                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Đáp án</p>
                                    </div>
                                    <p className="text-emerald-900 font-semibold">{exercise.answer || 'Chưa có đáp án chi tiết.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
