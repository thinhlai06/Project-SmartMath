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
        <div className="min-h-screen bg-slate-50">
            <main className="p-4 md:p-6">
                <div className="mx-auto max-w-[1600px]">
                    <PageHeader
                        title="Thiết kế bài tập CPA"
                        breadcrumbs={[
                            { label: 'AI Tools', href: '/cpa-wizard' },
                            { label: 'CPA Editor' },
                        ]}
                        actions={
                            <Button variant="outline" asChild>
                                <Link to="/classes">Quay lại lớp học</Link>
                            </Button>
                        }
                    />

                    {saveError && (
                        <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 h-4 w-4" />
                            <p>{saveError}</p>
                        </div>
                    )}

                    <div className="mt-6 grid gap-4 xl:grid-cols-[320px_1fr_320px]">
                        {/* Left Pane */}
                        <section className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Thiết lập lớp học</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Label htmlFor="class-selector">Lớp học</Label>
                                    <select
                                        id="class-selector"
                                        value={selectedClassId || ''}
                                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.class_name} (Lớp {cls.grade})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedClass && (
                                        <p className="text-xs text-slate-500">Đang soạn cho: {selectedClass.class_name}</p>
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
                        <section className="space-y-4">
                            <Card className="min-h-[620px]">
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between gap-3">
                                        <CardTitle className="text-base">Canvas / Preview</CardTitle>
                                        {selectedTopic && (
                                            <Badge className="bg-blue-100 text-blue-700">{selectedTopic.topic_name}</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4">
                                    <AIReviewWidget
                                        draftContent={draftContent}
                                        onApprove={handleApproveDraft}
                                        onReject={() => {
                                            setDraftContent('');
                                            setApprovedDraft('');
                                        }}
                                    />

                                    <div className="rounded-md border border-slate-200 bg-white p-4">
                                        <p className="mb-2 text-sm font-semibold text-slate-700">Nội dung đã duyệt</p>
                                        <pre className="min-h-[280px] whitespace-pre-wrap break-words rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                                            {approvedDraft || 'Chưa có nội dung được duyệt.'}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Right Pane */}
                        <section className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Properties</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="worksheet-title">Tiêu đề bài tập</Label>
                                        <Input
                                            id="worksheet-title"
                                            value={worksheetTitle}
                                            onChange={(e) => setWorksheetTitle(e.target.value)}
                                            placeholder="Ví dụ: CPA Phép cộng trong phạm vi 20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="worksheet-deadline">Hạn nộp</Label>
                                        <Input
                                            id="worksheet-deadline"
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="worksheet-objective">Mục tiêu</Label>
                                        <Input
                                            id="worksheet-objective"
                                            value={wizardData.standard}
                                            onChange={(e) => setWizardData((prev) => ({ ...prev, standard: e.target.value }))}
                                            placeholder="Mô tả mục tiêu học tập"
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleSave}
                                        disabled={isSaving || !selectedClassId || !approvedDraft.trim()}
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaving ? 'Đang lưu…' : 'Lưu vào kho học liệu'}
                                    </Button>
                                    {!approvedDraft.trim() && (
                                        <p className="text-xs text-amber-700">Vui lòng duyệt nội dung AI trước khi lưu.</p>
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
