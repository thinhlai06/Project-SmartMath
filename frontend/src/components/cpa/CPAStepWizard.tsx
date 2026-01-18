import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1Input } from './Step1Input';
import { Step2CPAGenerator } from './Step2CPAGenerator';
import { Step3Review } from './Step3Review';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

export function CPAStepWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState({
        topicId: '',
        standard: '',
        content: null as any
    });

    const handleStep1Submit = (data: { topicId: string, standard: string }) => {
        setWizardData({ ...wizardData, ...data });
        setCurrentStep(2);
    };

    const handleStep2Submit = (content: any) => {
        setWizardData({ ...wizardData, content });
        setCurrentStep(3);
    };

    const handleSave = () => {
        // Here we would save to backend
        alert('Đã lưu học liệu thành công! (Mock)');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            {/* Header / Progress */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Thiết kế CPA</h1>
                    <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full z-0 transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    ></div>
                    <div className="relative z-10 flex justify-between">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${step <= currentStep
                                        ? 'bg-blue-600 text-white border-white shadow-md'
                                        : 'bg-white text-gray-400 border-gray-100'
                                    }`}
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium text-gray-500 px-2">
                    <span>Chủ đề</span>
                    <span>Tạo nội dung</span>
                    <span>Hoàn tất</span>
                </div>
            </div>

            {/* Steps */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentStep === 1 && (
                    <Step1Input
                        onNext={handleStep1Submit}
                        initialData={{ topicId: wizardData.topicId, standard: wizardData.standard }}
                    />
                )}
                {currentStep === 2 && (
                    <Step2CPAGenerator
                        data={{ topicId: wizardData.topicId, standard: wizardData.standard }}
                        onNext={handleStep2Submit}
                        onBack={() => setCurrentStep(1)}
                    />
                )}
                {currentStep === 3 && (
                    <Step3Review
                        data={wizardData}
                        onBack={() => setCurrentStep(2)}
                        onSave={handleSave}
                    />
                )}
            </div>
        </div>
    );
}
