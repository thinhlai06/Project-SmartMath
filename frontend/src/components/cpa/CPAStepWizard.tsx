import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { classApi } from '../../services/classApi';
import type { MathClass } from '../../services/classApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, Save } from 'lucide-react';
import { AICreatorPanel, AIReviewWidget, PageHeader } from '@/components/redesign';

interface Topic {
    id: number;
    topic_name: string;
    grade: number;
}

export function CPAStepWizard() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [approvedDraft, setApprovedDraft] = useState('');
    const [draftContent, setDraftContent] = useState('');
    const [worksheetTitle, setWorksheetTitle] = useState('CPA - Bản nháp mới');
    const [deadline, setDeadline] = useState('');

    const [wizardData, setWizardData] = useState({
        topicId: '',
        standard: '',
        grade: 1,
        content: {
            concrete: '',
            pictorial: '',
            abstract: '',
            practice: '',
        }
    });

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classApi.getClasses();
                setClasses(data);
                if (data.length > 0) {
                    setSelectedClassId(data[0].id);
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };
        fetchClasses();
    }, []);

    // Fetch topics to get topic name
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch('/api/topics', {
                    credentials: 'include'
                });
                if (response.ok) {
                    setTopics(await response.json());
                }
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };
        fetchTopics();
    }, []);

    const handleGenerateDraft = async (params: { topic: string; diffLevel: number }) => {
        setIsGenerating(true);
        setSaveError(null);

        try {
            const topic = topics.find((t) => t.topic_name === params.topic);
            if (!topic) {
                throw new Error('Không tìm thấy chủ đề đã chọn');
            }

            const selectedTopicId = topic.id.toString();
            const objective = wizardData.standard || `Tạo nội dung phù hợp mức ${params.diffLevel}`;

            setWizardData((prev) => ({
                ...prev,
                topicId: selectedTopicId,
                grade: topic.grade,
                standard: objective,
            }));

            const response = await fetch('/api/ai/generate-cpa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    topic_id: topic.id,
                    grade: topic.grade,
                    objective,
                    counts: {
                        concrete: 2,
                        pictorial: 2,
                        abstract: 2,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Không thể tạo nội dung AI');
            }

            const result = await response.json();
            const toSection = (items: Array<{ question: string; answer: string }>) =>
                items.map((item, index) => `Câu ${index + 1}: ${item.question}\n(Đáp án: ${item.answer})`).join('\n\n');

            const nextContent = {
                concrete: toSection(result.concrete ?? []),
                pictorial: toSection(result.pictorial ?? []),
                abstract: toSection(result.abstract ?? []),
                practice: toSection(result.abstract ?? []),
            };

            setWizardData((prev) => ({ ...prev, content: nextContent }));
            setDraftContent([
                'Concrete:',
                nextContent.concrete,
                '',
                'Pictorial:',
                nextContent.pictorial,
                '',
                'Abstract:',
                nextContent.abstract,
            ].join('\n'));
        } catch (error: any) {
            setSaveError(error.message || 'Đã xảy ra lỗi khi tạo nội dung AI');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApproveDraft = async (content: string) => {
        setApprovedDraft(content);
    };

    const handleSave = async () => {
        if (!selectedClassId) {
            setSaveError('Vui lòng chọn lớp học');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const topic = topics.find(t => t.id.toString() === wizardData.topicId);

            // Create worksheet
            const worksheetResponse = await fetch(
                `/api/classes/${selectedClassId}/worksheets`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        title: worksheetTitle || `CPA: ${topic?.topic_name || 'Bài tập mới'}`,
                        topic_id: parseInt(wizardData.topicId) || null,
                        grade: wizardData.grade,
                        worksheet_type: 'cpa',
                        objective: wizardData.standard
                    })
                }
            );

            if (!worksheetResponse.ok) {
                const error = await worksheetResponse.json();
                throw new Error(error.detail || 'Không thể tạo bài tập');
            }

            const worksheet = await worksheetResponse.json();

            if (!approvedDraft.trim()) {
                throw new Error('Vui lòng duyệt nội dung AI trước khi lưu.');
            }

            const approvedLines = approvedDraft.trim();

            // Add exercises from approved CPA content
            const exercises = [
                { question: wizardData.content?.concrete || approvedLines, exercise_type: 'concrete', order_index: 0 },
                { question: wizardData.content?.pictorial || approvedLines, exercise_type: 'pictorial', order_index: 1 },
                { question: wizardData.content?.abstract || approvedLines, exercise_type: 'abstract', order_index: 2 }
            ];

            for (const exercise of exercises) {
                if (exercise.question) {
                    await fetch(
                        `/api/worksheets/${worksheet.id}/exercises`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify(exercise)
                        }
                    );
                }
            }

            // Success - navigate to worksheets page
            navigate(`/classes/${selectedClassId}/worksheets`);
        } catch (error: any) {
            setSaveError(error.message || 'Đã xảy ra lỗi khi lưu');
        } finally {
            setIsSaving(false);
        }
    };

    const availableTopics = topics.length > 0 ? topics.map((topic) => topic.topic_name) : ['Phép cộng'];

    const selectedClass = classes.find((item) => item.id === selectedClassId);
    const selectedTopic = topics.find((t) => t.id.toString() === wizardData.topicId);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-fuchsia-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            
            <main className="p-4 md:p-6 relative z-10 animate-in fade-in duration-500">
                <div className="mx-auto max-w-[1600px] space-y-6">
                    <PageHeader
                        title="Thiết kế bài tập CPA"
                        breadcrumbs={[
                            { label: 'AI Tools', href: '/cpa-wizard' },
                            { label: 'CPA Editor' },
                        ]}
                        actions={
                            <Button variant="outline" asChild className="rounded-xl border-slate-200 shadow-sm font-semibold hover:bg-slate-100 transition-colors">
                                <Link to="/classes">Quay lại lớp học</Link>
                            </Button>
                        }
                    />

                    {saveError && (
                        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 backdrop-blur-sm p-4 text-sm font-medium text-red-700 shadow-sm">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p>{saveError}</p>
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[320px_1fr_320px]">
                        {/* Left Pane */}
                        <section className="space-y-6">
                            <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                                <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-lg">🏫</span>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-800">Thiết lập lớp học</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="class-selector" className="font-semibold text-slate-700">Lớp học</Label>
                                        <select
                                            id="class-selector"
                                            value={selectedClassId || ''}
                                            onChange={(e) => setSelectedClassId(Number(e.target.value))}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-shadow"
                                        >
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.class_name} (Lớp {cls.grade})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedClass && (
                                        <div className="bg-indigo-50/80 rounded-xl p-3 border border-indigo-100/50">
                                            <p className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                Đang soạn cho: {selectedClass.class_name}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <AICreatorPanel
                                topics={availableTopics}
                                onGenerate={handleGenerateDraft}
                                isLoading={isGenerating}
                            />
                        </section>

                        {/* Center Pane */}
                        <section className="space-y-6">
                            <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft min-h-[620px] flex flex-col">
                                <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <span className="text-lg">✨</span>
                                            </div>
                                            <CardTitle className="text-lg font-bold text-slate-800">Canvas / Preview</CardTitle>
                                        </div>
                                        {selectedTopic && (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 font-bold rounded-lg border border-emerald-200/50">
                                                {selectedTopic.topic_name}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6 p-6 flex-1 flex flex-col">
                                    <AIReviewWidget
                                        draftContent={draftContent}
                                        onApprove={handleApproveDraft}
                                        onReject={() => {
                                            setDraftContent('');
                                            setApprovedDraft('');
                                        }}
                                    />

                                    <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 shadow-sm flex-1 flex flex-col">
                                        <p className="mb-3 text-base font-bold text-slate-800 flex items-center gap-2">
                                            <span className="text-green-500">✓</span> Nội dung đã duyệt
                                        </p>
                                        <pre className="flex-1 min-h-[280px] whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 border border-slate-100 shadow-inner">
                                            {approvedDraft || 'Chưa có nội dung được duyệt.'}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Right Pane */}
                        <section className="space-y-6">
                            <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                                <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <span className="text-lg">⚙️</span>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-800">Properties</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5 p-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="worksheet-title" className="font-semibold text-slate-700">Tiêu đề bài tập</Label>
                                        <Input
                                            id="worksheet-title"
                                            value={worksheetTitle}
                                            onChange={(e) => setWorksheetTitle(e.target.value)}
                                            placeholder="Ví dụ: CPA Phép cộng trong phạm vi 20"
                                            className="h-11 rounded-xl bg-white/80 border-slate-200 focus:ring-indigo-500/20 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="worksheet-deadline" className="font-semibold text-slate-700">Hạn nộp</Label>
                                        <Input
                                            id="worksheet-deadline"
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="h-11 rounded-xl bg-white/80 border-slate-200 focus:ring-indigo-500/20 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="worksheet-objective" className="font-semibold text-slate-700">Mục tiêu</Label>
                                        <Input
                                            id="worksheet-objective"
                                            value={wizardData.standard}
                                            onChange={(e) => setWizardData((prev) => ({ ...prev, standard: e.target.value }))}
                                            placeholder="Mô tả mục tiêu học tập"
                                            className="h-11 rounded-xl bg-white/80 border-slate-200 focus:ring-indigo-500/20 shadow-sm"
                                        />
                                    </div>

                                    <Button
                                        className="w-full h-12 mt-4 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all btn-bounce"
                                        onClick={handleSave}
                                        disabled={isSaving || !selectedClassId || !approvedDraft.trim()}
                                    >
                                        <Save className="h-5 w-5 mr-2" />
                                        {isSaving ? 'Đang lưu…' : 'Lưu vào kho học liệu'}
                                    </Button>
                                    {!approvedDraft.trim() && (
                                        <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200/50 mt-3">
                                            <p className="text-xs font-semibold text-amber-700 text-center flex items-center justify-center gap-1">
                                                <span>⚠️</span> Vui lòng duyệt nội dung AI trước khi lưu.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
