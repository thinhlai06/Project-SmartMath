import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiffStep1Config } from './DiffStep1Config';
import { DiffStep2Assignment } from './DiffStep2Assignment';
import { DiffStep3Content } from './DiffStep3Content';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { classApi } from '../../services/classApi';
import type { MathClass } from '../../services/classApi';

interface Topic {
    id: number;
    topic_name: string;
    grade: number;
}

export function DifferentiationWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);

    const [wizardData, setWizardData] = useState({
        topicId: '',
        strategy: '',
        grade: 1,
        assignments: null as any
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

    const selectedClass = classes.find((item) => item.id === selectedClassId);

    // Fetch topics
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const gradeParam = selectedClass ? `?grade=${selectedClass.grade}` : '';
                const response = await fetch(`/api/topics${gradeParam}`, {
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
    }, [selectedClass]);

    const handleStep1Submit = (data: { topicId: string, strategy: string, grade: number }) => {
        const lockedGrade = selectedClass?.grade ?? data.grade;
        setWizardData({ ...wizardData, ...data, grade: lockedGrade });
        setCurrentStep(2);
    };

    const handleStep2Submit = (assignments: any) => {
        setWizardData({ ...wizardData, assignments });
        setCurrentStep(3);
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
                        title: `Phân hóa: ${topic?.topic_name || 'Bài tập mới'}`,
                        topic_id: parseInt(wizardData.topicId) || null,
                        grade: wizardData.grade,
                        worksheet_type: 'differentiation',
                        objective: `Chiến lược: ${wizardData.strategy}`
                    })
                }
            );

            if (!worksheetResponse.ok) {
                const error = await worksheetResponse.json();
                throw new Error(error.detail || 'Không thể tạo bài tập');
            }

            const worksheet = await worksheetResponse.json();

            // Add exercises from tier assignments
            const tierOrder = ['foundation', 'standard', 'extension', 'advanced'];
            const tierLabels: Record<string, string> = {
                foundation: 'Nhận biết',
                standard: 'Thông hiểu',
                extension: 'Vận dụng',
                advanced: 'Vận dụng cao'
            };

            let orderIndex = 0;
            for (const tier of tierOrder) {
                const exercise = {
                    question: `[${tierLabels[tier]}] Bài tập phân hóa - Mức ${tierLabels[tier]}`,
                    difficulty_tier: tier,
                    order_index: orderIndex++
                };

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

            // Success - navigate to worksheets page
            navigate(`/classes/${selectedClassId}/worksheets`);
        } catch (error: any) {
            setSaveError(error.message || 'Đã xảy ra lỗi khi lưu');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans py-8 px-4">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Thiết kế Bài tập Phân hóa</h1>
                        <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors">
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Class Selector */}
                    <div className="mb-8 flex items-center gap-4 glass-panel bg-white/60 border-white/50 rounded-2xl p-4 shadow-sm w-fit mx-auto md:mx-0">
                        <label className="text-sm font-bold text-slate-700">Lớp học:</label>
                        <select
                            value={selectedClassId || ''}
                            onChange={(e) => setSelectedClassId(Number(e.target.value))}
                            className="px-4 py-2 border border-slate-200 rounded-xl bg-white/80 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-shadow"
                        >
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name} (Lớp {cls.grade})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-3xl mx-auto relative mt-4">
                        <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-200/60 backdrop-blur-sm -translate-y-1/2 rounded-full z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-indigo-500 to-emerald-400 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>
                        <div className="relative z-10 flex justify-between">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-base transition-all duration-500 border-4 ${step <= currentStep
                                        ? 'bg-indigo-600 text-white border-white shadow-soft scale-110'
                                        : 'bg-slate-50 text-slate-400 border-slate-200/60 scale-100'
                                        }`}
                                >
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="max-w-3xl mx-auto flex justify-between mt-3 text-sm font-bold text-slate-500 px-2">
                        <span className={currentStep >= 1 ? 'text-indigo-600' : ''}>Cấu hình</span>
                        <span className={currentStep >= 2 ? 'text-indigo-600' : ''}>Phân nhóm</span>
                        <span className={currentStep >= 3 ? 'text-indigo-600' : ''}>Nội dung</span>
                    </div>
                </div>

                {/* Save Error */}
                {saveError && (
                    <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl text-red-700 text-sm font-medium shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">⚠️</div>
                        {saveError}
                    </div>
                )}
            </div>

            {/* Steps */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentStep === 1 && (
                    <DiffStep1Config
                        onNext={handleStep1Submit}
                        initialData={{ topicId: wizardData.topicId, strategy: wizardData.strategy }}
                        lockedGrade={selectedClass?.grade}
                    />
                )}
                {currentStep === 2 && (
                    <DiffStep2Assignment
                        onNext={handleStep2Submit}
                        onBack={() => setCurrentStep(1)}
                        currentClassId={selectedClassId}
                        initialAssignments={wizardData.assignments}
                    />
                )}
                {currentStep === 3 && (
                    <DiffStep3Content
                        assignments={wizardData.assignments}
                        data={wizardData}
                        onBack={() => setCurrentStep(2)}
                        onSave={handleSave}
                        isSaving={isSaving}
                    />
                )}
            </div>
        </div>
    );
}
