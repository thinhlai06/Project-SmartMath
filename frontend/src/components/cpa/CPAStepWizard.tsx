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
import { AICreatorPanel, PageHeader } from '@/components/redesign';
import cpaBundleApi from '@/services/cpaBundleApi';
import type { CPABundle } from '@/types/cpaBundle';
import { CPABundleReviewPanel } from './CPABundleReviewPanel';
import type { BundleReviewStatus } from './CPABundleCard';

interface Topic {
    id: number;
    topic_name: string;
    grade: number;
    category: string;
}

const bundleKeyOf = (bundle: CPABundle, index: number): string => bundle.bundle_id || `bundle-${index}`;

export function CPAStepWizard() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reviewBundles, setReviewBundles] = useState<CPABundle[]>([]);
    const [bundleReviewStatuses, setBundleReviewStatuses] = useState<Record<string, BundleReviewStatus>>({});
    const [dirtyBundleMap, setDirtyBundleMap] = useState<Record<string, boolean>>({});
    const [isDirtySaveConfirmed, setIsDirtySaveConfirmed] = useState(false);
    const [worksheetTitle, setWorksheetTitle] = useState('CPA - Bản nháp mới');
    const [deadline, setDeadline] = useState('');

    const [wizardData, setWizardData] = useState({
        topicId: '',
        standard: '',
        grade: 1 as 1 | 2 | 3,
    });

    const initializeReviewState = (bundles: CPABundle[]) => {
        const nextStatuses: Record<string, BundleReviewStatus> = {};
        const nextDirtyMap: Record<string, boolean> = {};

        bundles.forEach((bundle, index) => {
            const key = bundleKeyOf(bundle, index);
            nextStatuses[key] = 'pending';
            nextDirtyMap[key] = false;
        });

        setBundleReviewStatuses(nextStatuses);
        setDirtyBundleMap(nextDirtyMap);
        setIsDirtySaveConfirmed(false);
    };

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
                    const allTopics = (await response.json()) as Topic[];
                    setTopics(allTopics);
                }
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };
        fetchTopics();
    }, []);

    useEffect(() => {
        if (!selectedClassId) {
            return;
        }

        const selectedClass = classes.find((item) => item.id === selectedClassId);
        if (!selectedClass) {
            return;
        }

        setWizardData((prev) => ({
            ...prev,
            grade: selectedClass.grade as 1 | 2 | 3,
        }));
    }, [classes, selectedClassId]);

    useEffect(() => {
        const selectedClass = classes.find((item) => item.id === selectedClassId);
        if (!selectedClass || !wizardData.topicId) {
            return;
        }

        const topic = topics.find((item) => item.id.toString() === wizardData.topicId);
        if (topic && topic.grade !== selectedClass.grade) {
            setWizardData((prev) => ({
                ...prev,
                topicId: '',
            }));
        }
    }, [classes, selectedClassId, topics, wizardData.topicId]);

    const handleGenerateDraft = async (params: { topic: string; diffLevel: number }) => {
        setIsGenerating(true);
        setSaveError(null);

        try {
            const selectedClass = classes.find((item) => item.id === selectedClassId);
            if (!selectedClass) {
                throw new Error('Vui lòng chọn lớp học trước khi tạo bản nháp.');
            }

            const topic = topics.find(
                (t) => t.topic_name === params.topic && t.grade === selectedClass.grade
            );
            if (!topic) {
                throw new Error('Chủ đề không thuộc khối lớp đã chọn. Vui lòng chọn lại chủ đề phù hợp.');
            }

            const selectedTopicId = topic.id.toString();
            const objective = wizardData.standard || `Tạo nội dung phù hợp mức ${params.diffLevel}`;

            setWizardData((prev) => ({
                ...prev,
                topicId: selectedTopicId,
                grade: topic.grade as 1 | 2 | 3,
                standard: objective,
            }));

            const request = {
                topic_id: topic.id,
                grade: selectedClass.grade as 1 | 2 | 3,
                objective,
                bundle_count: 3,
            };

            // Always try bundle-v2 first; API layer will fallback to legacy if a family is not yet supported.
            const result = await cpaBundleApi.generateBundles(request);

            setReviewBundles(result.bundles);
            initializeReviewState(result.bundles);
        } catch (error: any) {
            setSaveError(error.message || 'Đã xảy ra lỗi khi tạo nội dung AI');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBundleStatusChange = (bundleKey: string, nextStatus: BundleReviewStatus) => {
        setBundleReviewStatuses((prev) => ({
            ...prev,
            [bundleKey]: nextStatus,
        }));
    };

    const handleBundleChange = (index: number, nextBundle: CPABundle) => {
        setReviewBundles((prev) =>
            prev.map((bundle, bundleIndex) => (bundleIndex === index ? nextBundle : bundle))
        );

        const bundleKey = bundleKeyOf(nextBundle, index);
        setDirtyBundleMap((prev) => ({ ...prev, [bundleKey]: true }));
        setIsDirtySaveConfirmed(false);
    };

    const handleApproveAll = () => {
        setBundleReviewStatuses((prev) => {
            const next = { ...prev };
            reviewBundles.forEach((bundle, index) => {
                next[bundleKeyOf(bundle, index)] = 'approved';
            });
            return next;
        });
    };

    const handleResetAllReviewStates = () => {
        setBundleReviewStatuses((prev) => {
            const next = { ...prev };
            reviewBundles.forEach((bundle, index) => {
                next[bundleKeyOf(bundle, index)] = 'pending';
            });
            return next;
        });
    };

    const handleSave = async () => {
        if (!selectedClassId) {
            setSaveError('Vui lòng chọn lớp học');
            return;
        }

        if (reviewBundles.length === 0) {
            setSaveError('Vui lòng tạo CPA bundles trước khi lưu.');
            return;
        }

        const approvedEntries = reviewBundles
            .map((bundle, index) => ({ bundle, key: bundleKeyOf(bundle, index) }))
            .filter((item) => bundleReviewStatuses[item.key] === 'approved');
        const approvedBundles = approvedEntries.map((item) => item.bundle);

        if (approvedBundles.length === 0) {
            setSaveError('Vui lòng duyệt ít nhất 1 bundle trước khi lưu.');
            return;
        }

        const hasFailedApprovedBundle = approvedBundles.some((bundle) => bundle.validation_status === 'failed');
        if (hasFailedApprovedBundle) {
            setSaveError('Có bundle đang ở trạng thái failed. Vui lòng chỉnh sửa hoặc từ chối bundle đó.');
            return;
        }

        const dirtyApprovedCount = approvedEntries.filter((item) => Boolean(dirtyBundleMap[item.key])).length;

        if (dirtyApprovedCount > 0 && !isDirtySaveConfirmed) {
            setSaveError(
                `Có ${dirtyApprovedCount} bundle đã chỉnh sửa. Bấm Lưu thêm 1 lần để xác nhận re-validate khi lưu.`
            );
            setIsDirtySaveConfirmed(true);
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

            await cpaBundleApi.saveBundles(worksheet.id, approvedBundles);

            const exercises = approvedBundles.flatMap((bundle, bundleIndex) => {
                const baseIndex = bundleIndex * 3;
                return [
                    {
                        question: `${bundle.concrete.action_instruction}\n${bundle.concrete.result_prompt}`,
                        answer: bundle.concrete.answer,
                        exercise_type: 'concrete',
                        order_index: baseIndex,
                    },
                    {
                        question: `${bundle.pictorial.question_text}\n[Sơ đồ: ${bundle.pictorial.diagram_type}]`,
                        answer: bundle.pictorial.answer,
                        exercise_type: 'pictorial',
                        order_index: baseIndex + 1,
                    },
                    {
                        question: bundle.abstract.expression,
                        answer: bundle.abstract.answer,
                        hint: bundle.abstract.hint,
                        exercise_type: 'abstract',
                        order_index: baseIndex + 2,
                    },
                ];
            });

            for (const exercise of exercises) {
                await fetch(`/api/worksheets/${worksheet.id}/exercises`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(exercise),
                });
            }

            // Success - navigate to worksheets page
            navigate(`/classes/${selectedClassId}/worksheets`);
        } catch (error: any) {
            setSaveError(error.message || 'Đã xảy ra lỗi khi lưu');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedClass = classes.find((item) => item.id === selectedClassId);
    const lockedGrade = selectedClass?.grade;
    const gradeLockedTopics = topics.filter((topic) => (lockedGrade ? topic.grade === lockedGrade : true));
    const availableTopics = gradeLockedTopics.map((topic) => topic.topic_name);
    const selectedTopic = gradeLockedTopics.find((t) => t.id.toString() === wizardData.topicId);
    const approvedCount = reviewBundles.filter(
        (bundle, index) => bundleReviewStatuses[bundleKeyOf(bundle, index)] === 'approved'
    ).length;
    const rejectedCount = reviewBundles.filter(
        (bundle, index) => bundleReviewStatuses[bundleKeyOf(bundle, index)] === 'rejected'
    ).length;
    const pendingCount = Math.max(0, reviewBundles.length - approvedCount - rejectedCount);
    const dirtyApprovedCount = reviewBundles.filter(
        (bundle, index) =>
            bundleReviewStatuses[bundleKeyOf(bundle, index)] === 'approved' &&
            Boolean(dirtyBundleMap[bundleKeyOf(bundle, index)])
    ).length;

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
                                            <p className="mt-1 text-xs font-semibold text-indigo-600">
                                                Chủ đề được khóa theo Lớp {selectedClass.grade}.
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

                            <div className="rounded-2xl border border-sky-200/70 bg-sky-50/80 p-4 text-xs font-semibold text-sky-700 shadow-sm">
                                CPA bundle đã mở rộng family theo chủ đề: Số học, Hình học, Đo lường. Các family khác sẽ được mở theo roadmap.
                            </div>
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
                                    <CPABundleReviewPanel
                                        bundles={reviewBundles}
                                        reviewStatuses={bundleReviewStatuses}
                                        dirtyBundleMap={dirtyBundleMap}
                                        onBundleChange={handleBundleChange}
                                        onStatusChange={handleBundleStatusChange}
                                        onApproveAll={handleApproveAll}
                                        onResetAll={handleResetAllReviewStates}
                                    />
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

                                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-700">
                                            Duyệt: {approvedCount}
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-700">
                                            Chờ: {pendingCount}
                                        </div>
                                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700">
                                            Từ chối: {rejectedCount}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 mt-4 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all btn-bounce"
                                        onClick={handleSave}
                                        disabled={isSaving || !selectedClassId || approvedCount === 0}
                                    >
                                        <Save className="h-5 w-5 mr-2" />
                                        {isSaving ? 'Đang lưu…' : 'Lưu vào kho học liệu'}
                                    </Button>
                                    {approvedCount === 0 && (
                                        <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200/50 mt-3">
                                            <p className="text-xs font-semibold text-amber-700 text-center flex items-center justify-center gap-1">
                                                <span>⚠️</span> Vui lòng duyệt ít nhất 1 bundle trước khi lưu.
                                            </p>
                                        </div>
                                    )}

                                    {dirtyApprovedCount > 0 && (
                                        <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200/50">
                                            <p className="text-xs font-semibold text-amber-700 text-center">
                                                Có {dirtyApprovedCount} bundle đã chỉnh sửa. Hệ thống sẽ re-validate khi lưu.
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
