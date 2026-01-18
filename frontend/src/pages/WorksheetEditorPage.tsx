import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { worksheetApi, exerciseApi } from '../services/worksheetApi';
import type { WorksheetDetail, Exercise, ExerciseCreate, ExerciseType, DifficultyTier } from '../services/worksheetApi';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// CPA section labels
const CPA_SECTIONS: { type: ExerciseType; label: string; color: string; description: string }[] = [
    { type: 'concrete', label: 'Cụ thể (Concrete)', color: 'bg-orange-100 text-orange-700 border-orange-300', description: 'Sử dụng vật thật, đồ dùng học tập' },
    { type: 'pictorial', label: 'Hình ảnh (Pictorial)', color: 'bg-blue-100 text-blue-700 border-blue-300', description: 'Sử dụng hình vẽ, sơ đồ' },
    { type: 'abstract', label: 'Trừu tượng (Abstract)', color: 'bg-purple-100 text-purple-700 border-purple-300', description: 'Sử dụng ký hiệu, phép tính' },
];

// Differentiation tier labels
const DIFF_TIERS: { tier: DifficultyTier; label: string; color: string; icon: string }[] = [
    { tier: 'foundation', label: 'Nền tảng', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🌱' },
    { tier: 'standard', label: 'Chuẩn', color: 'bg-green-100 text-green-700 border-green-300', icon: '📘' },
    { tier: 'extension', label: 'Mở rộng', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '💎' },
    { tier: 'advanced', label: 'Nâng cao', color: 'bg-red-100 text-red-700 border-red-300', icon: '🏆' },
];

export function WorksheetEditorPage() {
    const { worksheetId } = useParams<{ worksheetId: string }>();
    const navigate = useNavigate();
    const [worksheet, setWorksheet] = useState<WorksheetDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // New exercise form state
    const [newExercise, setNewExercise] = useState<ExerciseCreate>({
        question: '',
        answer: '',
        hint: '',
    });
    const [activeSection, setActiveSection] = useState<ExerciseType | DifficultyTier | null>(null);

    const id = parseInt(worksheetId || '0', 10);

    useEffect(() => {
        if (id) {
            fetchWorksheet();
        }
    }, [id]);

    const fetchWorksheet = async () => {
        try {
            setIsLoading(true);
            const data = await worksheetApi.getWorksheet(id);
            setWorksheet(data);
        } catch (err) {
            setError('Không thể tải bài tập');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddExercise = async (type: ExerciseType | DifficultyTier) => {
        if (!newExercise.question.trim() || !worksheet) return;

        try {
            setIsSaving(true);
            const createData: ExerciseCreate = {
                question: newExercise.question,
                answer: newExercise.answer || undefined,
                hint: newExercise.hint || undefined,
            };

            // Set type based on worksheet type
            if (worksheet.worksheet_type === 'cpa') {
                createData.exercise_type = type as ExerciseType;
            } else {
                createData.difficulty_tier = type as DifficultyTier;
            }

            await exerciseApi.createExercise(id, createData);
            setNewExercise({ question: '', answer: '', hint: '' });
            setActiveSection(null);
            await fetchWorksheet();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Không thể thêm câu hỏi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        if (!confirm('Xóa câu hỏi này?')) return;

        try {
            await exerciseApi.deleteExercise(exerciseId);
            await fetchWorksheet();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Không thể xóa câu hỏi');
        }
    };

    const getExercisesForSection = (type: ExerciseType | DifficultyTier): Exercise[] => {
        if (!worksheet) return [];

        if (worksheet.worksheet_type === 'cpa') {
            return worksheet.exercises.filter(e => e.exercise_type === type);
        } else {
            return worksheet.exercises.filter(e => e.difficulty_tier === type);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!worksheet) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
                <p className="text-gray-500">Không tìm thấy bài tập</p>
            </div>
        );
    }

    const sections = worksheet.worksheet_type === 'cpa' ? CPA_SECTIONS : DIFF_TIERS;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={() => navigate(`/classes/${worksheet.class_id}/worksheets`)}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài tập
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">{worksheet.title}</h1>
                        <div className="flex gap-2 mt-2">
                            <Badge className={worksheet.worksheet_type === 'cpa' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                                {worksheet.worksheet_type === 'cpa' ? 'CPA' : 'Phân hóa'}
                            </Badge>
                            <Badge className={worksheet.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                {worksheet.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                            </Badge>
                            <span className="text-sm text-gray-500">Lớp {worksheet.grade}</span>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                        <button onClick={() => setError(null)} className="ml-4 underline">Đóng</button>
                    </div>
                )}

                {/* Published warning */}
                {worksheet.status === 'published' && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6">
                        ⚠️ Bài tập đã xuất bản. Hãy hủy xuất bản để chỉnh sửa.
                    </div>
                )}

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section) => {
                        const sectionType = 'type' in section ? section.type : section.tier;
                        const exercises = getExercisesForSection(sectionType);
                        const isActive = activeSection === sectionType;

                        return (
                            <Card key={sectionType} className={`border-2 ${section.color.split(' ')[2] || 'border-gray-200'}`}>
                                <CardHeader className={section.color.split(' ').slice(0, 2).join(' ')}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {'icon' in section && <span>{section.icon}</span>}
                                            <CardTitle className="text-lg">{section.label}</CardTitle>
                                            <span className="text-sm opacity-70">({exercises.length} câu)</span>
                                        </div>
                                        {worksheet.status !== 'published' && (
                                            <Button
                                                size="sm"
                                                variant={isActive ? 'default' : 'outline'}
                                                onClick={() => setActiveSection(isActive ? null : sectionType)}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Thêm câu hỏi
                                            </Button>
                                        )}
                                    </div>
                                    {'description' in section && (
                                        <p className="text-sm opacity-70 mt-1">{section.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {/* Existing exercises */}
                                    {exercises.length > 0 ? (
                                        <div className="space-y-3 mb-4">
                                            {exercises.map((ex, idx) => (
                                                <div key={ex.id} className="flex items-start gap-3 p-3 bg-white border rounded-lg">
                                                    <span className="text-gray-400 text-sm mt-1">{idx + 1}.</span>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{ex.question}</p>
                                                        {ex.answer && (
                                                            <p className="text-sm text-green-600 mt-1">Đáp án: {ex.answer}</p>
                                                        )}
                                                        {ex.hint && (
                                                            <p className="text-sm text-blue-500 mt-1">Gợi ý: {ex.hint}</p>
                                                        )}
                                                    </div>
                                                    {worksheet.status !== 'published' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteExercise(ex.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">Chưa có câu hỏi</p>
                                    )}

                                    {/* Add new exercise form */}
                                    {isActive && worksheet.status !== 'published' && (
                                        <div className="border-t pt-4 mt-4 space-y-3">
                                            <div>
                                                <Label>Câu hỏi</Label>
                                                <Input
                                                    placeholder="Nhập câu hỏi..."
                                                    value={newExercise.question}
                                                    onChange={(e) => setNewExercise({ ...newExercise, question: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label>Đáp án (tùy chọn)</Label>
                                                    <Input
                                                        placeholder="Đáp án..."
                                                        value={newExercise.answer}
                                                        onChange={(e) => setNewExercise({ ...newExercise, answer: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Gợi ý (tùy chọn)</Label>
                                                    <Input
                                                        placeholder="Gợi ý..."
                                                        value={newExercise.hint}
                                                        onChange={(e) => setNewExercise({ ...newExercise, hint: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleAddExercise(sectionType)}
                                                    disabled={isSaving || !newExercise.question.trim()}
                                                >
                                                    {isSaving ? 'Đang lưu...' : 'Thêm câu hỏi'}
                                                </Button>
                                                <Button variant="outline" onClick={() => setActiveSection(null)}>
                                                    Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-8 p-4 bg-white rounded-lg border">
                    <p className="text-gray-600">
                        Tổng cộng: <strong>{worksheet.exercises.length}</strong> câu hỏi
                    </p>
                </div>
            </div>
        </div>
    );
}

export default WorksheetEditorPage;
