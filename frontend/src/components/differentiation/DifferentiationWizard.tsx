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

    // Fetch topics
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('http://localhost:8000/api/topics', {
                    headers: { 'Authorization': `Bearer ${token}` }
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

    const handleStep1Submit = (data: { topicId: string, strategy: string, grade: number }) => {
        setWizardData({ ...wizardData, ...data });
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
            const token = localStorage.getItem('access_token');
            const topic = topics.find(t => t.id.toString() === wizardData.topicId);

            // Create worksheet
            const worksheetResponse = await fetch(
                `http://localhost:8000/api/classes/${selectedClassId}/worksheets`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
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
                    `http://localhost:8000/api/worksheets/${worksheet.id}/exercises`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Thiết kế Bài tập Phân hóa</h1>
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Class Selector */}
                <div className="mb-4 flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Lớp học:</label>
                    <select
                        value={selectedClassId || ''}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                    >
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.class_name} (Lớp {cls.grade})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Progress Bar */}
                <div className="max-w-3xl mx-auto relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full z-0 transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    ></div>
                    <div className="relative z-10 flex justify-between">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${step <= currentStep
                                    ? 'bg-indigo-600 text-white border-white shadow-md'
                                    : 'bg-white text-gray-400 border-gray-100'
                                    }`}
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="max-w-3xl mx-auto flex justify-between mt-2 text-xs font-medium text-gray-500 px-2">
                    <span>Cấu hình</span>
                    <span>Phân nhóm</span>
                    <span>Nội dung</span>
                </div>
            </div>

            {/* Save Error */}
            {saveError && (
                <div className="max-w-6xl mx-auto mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {saveError}
                </div>
            )}

            {/* Steps */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentStep === 1 && (
                    <DiffStep1Config
                        onNext={handleStep1Submit}
                        initialData={{ topicId: wizardData.topicId, strategy: wizardData.strategy }}
                    />
                )}
                {currentStep === 2 && (
                    <DiffStep2Assignment
                        onNext={handleStep2Submit}
                        onBack={() => setCurrentStep(1)}
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
