import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Download, WandSparkles } from 'lucide-react';
import { worksheetApi, exerciseApi } from '../services/worksheetApi';
import type { WorksheetDetail, Exercise, ExerciseCreate, ExerciseType, DifficultyTier } from '../services/worksheetApi';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    AICreatorPanel,
    AIReviewWidget,
    DiffLevelBadge,
    MathFormattedText,
    PageHeader,
} from '@/components/redesign';
import aiApi from '@/services/aiApi';

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
    const [aiDraft, setAiDraft] = useState('');
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
    const [activeSection, setActiveSection] = useState<ExerciseType | DifficultyTier | null>(null);
    const [exerciseExplanations, setExerciseExplanations] = useState<Record<number, string>>({});
    const [explanationLoading, setExplanationLoading] = useState<Record<number, boolean>>({});

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

    const handleGenerateDraft = async (params: { topic: string; diffLevel: number }) => {
        setIsGeneratingDraft(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const sampleQuestion =
            params.diffLevel === 1
                ? `Viết 1 phép tính ${params.topic.toLowerCase()} đơn giản cho học sinh lớp ${worksheet?.grade ?? 1}.`
                : params.diffLevel === 2
                    ? `Tạo bài toán lời văn ngắn về ${params.topic.toLowerCase()} phù hợp lớp ${worksheet?.grade ?? 1}.`
                    : `Tạo câu hỏi vận dụng ${params.topic.toLowerCase()} có 2 bước giải cho lớp ${worksheet?.grade ?? 1}.`;

        setAiDraft(sampleQuestion);
        setIsGeneratingDraft(false);
    };

    const handleApproveDraft = (content: string) => {
        setNewExercise((prev) => ({ ...prev, question: content }));
        setAiDraft('');
    };

    const handleGenerateExplanation = async (exerciseId: number) => {
        try {
            setExplanationLoading((prev) => ({ ...prev, [exerciseId]: true }));
            const response = await aiApi.explainExercise(exerciseId, { response_style: 'ngan gon' });
            setExerciseExplanations((prev) => ({
                ...prev,
                [exerciseId]: response.explanation,
            }));
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Không thể tạo giải thích AI');
        } finally {
            setExplanationLoading((prev) => ({ ...prev, [exerciseId]: false }));
        }
    };

    const handlePrintWorksheet = () => {
        // Give DOM a moment to update before opening browser print dialog
        setTimeout(() => window.print(), 200);
    };


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin drop-shadow-sm" />
            </div>
        );
    }

    if (!worksheet) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-medium">Không tìm thấy bài tập</p>
            </div>
        );
    }

    const sections = worksheet.worksheet_type === 'cpa' ? CPA_SECTIONS : DIFF_TIERS;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans p-6 print:min-h-0 print:bg-white print:p-0">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none print:hidden" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none print:hidden" />
            <div className="max-w-5xl mx-auto relative z-10 print:relative print:z-0 print:w-[210mm] print:h-[297mm] print:max-w-none print:overflow-visible print:bg-white print:text-black print:p-8 print:mx-auto">
                <div className="print:hidden">
                    <PageHeader
                        title={worksheet.title}
                        breadcrumbs={[
                            { label: 'Classes', href: '/classes' },
                            { label: 'Worksheets', href: `/classes/${worksheet.class_id}/worksheets` },
                            { label: 'Editor' },
                        ]}
                        actions={(
                            <Button
                                variant="outline"
                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                onClick={handlePrintWorksheet}
                            >
                                <Download className="w-4 h-4" />
                                In worksheet
                            </Button>
                        )}
                        className="mb-3"
                    />
                </div>
                <div className="hidden print:block mb-6 border-b border-slate-300 pb-3">
                    <h1 className="text-2xl font-bold tracking-tight text-black">{worksheet.title}</h1>
                    <p className="text-sm text-slate-700 mt-1">Lớp {worksheet.grade} • Smart-MathAI</p>
                </div>
                <div className="mb-8 flex flex-wrap gap-2">
                    <Badge className={worksheet.worksheet_type === 'cpa' ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200 px-3 py-1' : 'bg-purple-100/80 text-purple-700 hover:bg-purple-200 px-3 py-1'}>
                        {worksheet.worksheet_type === 'cpa' ? 'CPA' : 'Phân hóa'}
                    </Badge>
                    <Badge className={worksheet.status === 'published' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1'}>
                        {worksheet.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                    </Badge>
                    <span className="text-sm font-medium text-slate-500 bg-white/60 px-3 py-1 rounded-full border border-slate-200">Lớp {worksheet.grade}</span>
                </div>

                {worksheet.status !== 'published' && (
                    <div className="mb-6 grid gap-4 lg:grid-cols-2 print:hidden">
                        <AICreatorPanel
                            topics={['Phép cộng', 'Phép trừ', 'So sánh số', 'Bài toán lời văn']}
                            onGenerate={handleGenerateDraft}
                            isLoading={isGeneratingDraft}
                        />
                        <AIReviewWidget
                            draftContent={aiDraft}
                            onApprove={handleApproveDraft}
                            onReject={() => setAiDraft('')}
                        />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="glass-panel bg-red-50/80 border-red-200 text-red-600 p-4 rounded-2xl mb-6 shadow-sm flex items-center justify-between font-medium print:hidden">
                        {error}
                        <button onClick={() => setError(null)} className="ml-4 underline hover:text-red-800 transition-colors">Đóng</button>
                    </div>
                )}

                {/* Published warning */}
                {worksheet.status === 'published' && (
                    <div className="glass-panel bg-amber-50/80 border-amber-200 text-amber-700 p-4 rounded-2xl mb-8 shadow-sm flex items-center font-medium gap-2 print:hidden">
                        <span>⚠️</span> Bài tập đã xuất bản. Hãy hủy xuất bản để chỉnh sửa.
                    </div>
                )}

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section) => {
                        const sectionType = 'type' in section ? section.type : section.tier;
                        const exercises = getExercisesForSection(sectionType);
                        const isActive = activeSection === sectionType;

                        return (
                            <Card key={sectionType} className={`glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft transition-all print:rounded-none print:border-slate-300 print:shadow-none print:bg-white ${isActive ? 'ring-2 ring-indigo-500/30 print:ring-0' : ''}`}>
                                <CardHeader className={`border-b border-white/40 bg-white/40 p-5 print:bg-white print:border-slate-200 print:pb-3`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {'icon' in section && <span className="text-2xl drop-shadow-sm">{section.icon}</span>}
                                            <CardTitle className="text-xl font-bold text-slate-800">{section.label}</CardTitle>
                                            <span className="text-sm font-semibold text-slate-500 bg-white/50 px-2 py-0.5 rounded-md">({exercises.length} câu)</span>
                                            {'tier' in section && (
                                                <DiffLevelBadge level={section.tier === 'foundation' ? 1 : section.tier === 'standard' ? 2 : 3} />
                                            )}
                                        </div>
                                        {worksheet.status !== 'published' && (
                                            <Button
                                                size="sm"
                                                variant={isActive ? 'default' : 'outline'}
                                                className={`print:hidden ${isActive ? 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm' : 'rounded-xl hover:bg-slate-100'}`}
                                                onClick={() => setActiveSection(isActive ? null : sectionType)}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Thêm câu hỏi
                                            </Button>
                                        )}
                                    </div>
                                    {'description' in section && (
                                        <p className="text-sm font-medium text-slate-500 mt-2">{section.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent className="p-5 bg-white/20 print:bg-white print:p-4">
                                    {/* Existing exercises */}
                                    {exercises.length > 0 ? (
                                        <div className="space-y-4 mb-4">
                                            {exercises.map((ex, idx) => (
                                                <div key={ex.id} className="question-item flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm border border-slate-100/50 rounded-2xl shadow-sm hover:shadow-soft transition-all group print:break-inside-avoid print:page-break-inside-avoid print:[page-break-inside:avoid] print:rounded-lg print:shadow-none print:border-slate-200 print:bg-white">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm shrink-0 mt-0.5">{idx + 1}</span>
                                                    <div className="flex-1 mt-1">
                                                        <div className="text-slate-800 font-medium print:text-xl print:font-sans print:leading-loose print:text-black">
                                                            <MathFormattedText text={ex.question} />
                                                        </div>
                                                        {ex.answer && (
                                                            <p className="text-sm text-emerald-600 mt-2 font-medium bg-emerald-50 inline-block px-2 py-1 rounded-md print:text-black print:bg-transparent print:px-0 print:py-0">Đáp án: {ex.answer}</p>
                                                        )}
                                                        {ex.hint && (
                                                            <p className="text-sm text-indigo-600 mt-2 ml-2 font-medium bg-indigo-50 inline-block px-2 py-1 rounded-md print:text-black print:bg-transparent print:px-0 print:py-0">Gợi ý: {ex.hint}</p>
                                                        )}
                                                        <div className="mt-3 flex items-center gap-2 print:hidden">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                                onClick={() => handleGenerateExplanation(ex.id)}
                                                                disabled={!!explanationLoading[ex.id]}
                                                            >
                                                                <WandSparkles className="w-4 h-4 mr-1" />
                                                                {explanationLoading[ex.id] ? 'Đang tạo...' : 'Giải thích AI'}
                                                            </Button>
                                                        </div>

                                                        {exerciseExplanations[ex.id] && (
                                                            <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap print:hidden">
                                                                <p className="font-semibold mb-1">Giải thích từng bước:</p>
                                                                {exerciseExplanations[ex.id]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {worksheet.status !== 'published' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 print:hidden"
                                                            onClick={() => handleDeleteExercise(ex.id)}
                                                            aria-label={`Xóa câu hỏi ${idx + 1}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-slate-400 font-medium">Chưa có câu hỏi nào trong phần này</p>
                                        </div>
                                    )}

                                    {/* Add new exercise form */}
                                    {isActive && worksheet.status !== 'published' && (
                                        <div className="border-t border-slate-200/50 pt-5 mt-5 space-y-4 print:hidden">
                                            <div>
                                                <Label className="text-slate-700 font-semibold">Câu hỏi</Label>
                                                <Input
                                                    className="mt-1"
                                                    placeholder="Nhập câu hỏi..."
                                                    value={newExercise.question}
                                                    onChange={(e) => setNewExercise({ ...newExercise, question: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-slate-700 font-semibold">Đáp án (tùy chọn)</Label>
                                                    <Input
                                                        className="mt-1"
                                                        placeholder="Đáp án..."
                                                        value={newExercise.answer}
                                                        onChange={(e) => setNewExercise({ ...newExercise, answer: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-slate-700 font-semibold">Gợi ý (tùy chọn)</Label>
                                                    <Input
                                                        className="mt-1"
                                                        placeholder="Gợi ý..."
                                                        value={newExercise.hint}
                                                        onChange={(e) => setNewExercise({ ...newExercise, hint: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-soft"
                                                    onClick={() => handleAddExercise(sectionType)}
                                                    disabled={isSaving || !newExercise.question.trim()}
                                                >
                                                    {isSaving ? 'Đang lưu...' : 'Lưu câu hỏi'}
                                                </Button>
                                                <Button variant="outline" className="rounded-xl hover:bg-slate-100" onClick={() => setActiveSection(null)}>
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
                <div className="mt-8 glass-panel border-white/50 p-6 rounded-3xl shadow-sm flex items-center justify-between print:hidden">
                    <p className="text-slate-600 font-medium text-lg">
                        Tổng số lượng câu hỏi: <strong className="text-indigo-600 text-2xl ml-2">{worksheet.exercises.length}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default WorksheetEditorPage;
