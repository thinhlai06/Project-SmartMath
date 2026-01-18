import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIGradingPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
    const [progress, setProgress] = useState(0);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            simulateProcessing();
        }
    };

    const simulateProcessing = () => {
        setStep('processing');
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStep('result');
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const handleReset = () => {
        setStep('upload');
        setProgress(0);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chấm điểm AI (Beta)</h1>
                    <p className="text-muted-foreground mt-2">Tải lên ảnh bài làm để AI tự động chấm điểm và nhận xét.</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 px-3 py-1">
                    Experimental
                </Badge>
            </div>

            {/* Privacy Notice Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-blue-800 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>
                    <strong>Thông báo quyền riêng tư:</strong> Ảnh bài làm của học sinh được xử lý tự động để chấm điểm và
                    <span className="underline decoration-blue-400 decoration-wavy underline-offset-2 ml-1">không được lưu trữ vĩnh viễn</span>
                    trên hệ thống của chúng tôi.
                </p>
            </div>

            {/* Main Content Area */}
            <Card className="border-2 border-dashed border-gray-200 shadow-sm overflow-hidden">
                <CardContent className="p-0 min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 relative">

                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div className="text-center space-y-6 p-10 animate-in zoom-in-50 duration-300">
                            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
                                <Upload className="w-10 h-10 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-gray-900">Tải ảnh bài tập lên</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">Kéo thả ảnh vào đây hoặc bấm nút bên dưới để chọn ảnh.</p>
                            </div>
                            <div className="flex gap-4 justify-center pt-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <Button onClick={handleUploadClick} size="lg" className="gap-2 shadow-md hover:shadow-lg transition-all">
                                    <Upload className="w-4 h-4" /> Chọn ảnh
                                </Button>
                                <Button variant="outline" size="lg" className="gap-2" onClick={handleUploadClick}>
                                    <Camera className="w-4 h-4" /> Chụp ảnh
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Processing */}
                    {step === 'processing' && (
                        <div className="w-full max-w-md space-y-6 text-center animate-in fade-in duration-300">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div
                                    className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
                                ></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Đang phân tích bài làm...</h3>
                                <p className="text-gray-500 mt-1">Vui lòng đợi giây lát</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-linear"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-400">{progress}% hoàn thành</p>
                        </div>
                    )}

                    {/* Step 3: Result (Mock) */}
                    {step === 'result' && (
                        <div className="w-full h-full flex flex-col md:flex-row animate-in slide-in-from-bottom-5 duration-500">
                            {/* Image Preview (Left) */}
                            <div className="flex-1 bg-gray-900 p-4 flex items-center justify-center relative group overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://placehold.co/600x800/222/444?text=Worksheet+Image')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
                                {/* Mock Overlays */}
                                <div className="absolute top-[20%] left-[30%] bg-green-500/20 border-2 border-green-500 w-16 h-8 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 bg-white rounded-full" />
                                </div>
                                <div className="absolute top-[40%] right-[30%] bg-red-500/20 border-2 border-red-500 w-16 h-8 rounded flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                    <span className="text-red-500 font-bold bg-white px-1 rounded text-xs">-0.5</span>
                                </div>
                                <p className="relative z-10 text-white font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                                    Xem lại bản gốc
                                </p>
                            </div>

                            {/* Result Details (Right) */}
                            <div className="w-full md:w-96 bg-white border-l border-gray-200 p-6 flex flex-col h-full">
                                <div className="space-y-6 flex-1">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Kết quả chấm điểm</h3>
                                        <div className="mt-2 flex items-baseline gap-2">
                                            <span className="text-5xl font-extrabold text-green-600">9.5</span>
                                            <span className="text-xl text-gray-400 font-medium">/ 10</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Nhận xét của AI:</h4>
                                        <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm leading-relaxed border border-green-100">
                                            "Bài làm rất tốt! Con đã hiểu rõ về phép nhân và phép chia. Chỉ có một lỗi nhỏ ở câu 4, con cần chú ý hơn về dấu khi chuyển vế nhé."
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Chi tiết:</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Câu 1: Phép tính đúng</span>
                                                <span className="font-medium text-gray-900">2.0/2.0</span>
                                            </li>
                                            <li className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Câu 2: Lời giải chính xác</span>
                                                <span className="font-medium text-gray-900">3.0/3.0</span>
                                            </li>
                                            <li className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100">
                                                <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /> Câu 3: Sai dấu</span>
                                                <span className="font-medium text-red-600">4.5/5.0</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-6 border-t mt-6 space-y-3">
                                    <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200" onClick={() => navigate('/parent/dashboard')}>
                                        Lưu kết quả
                                    </Button>
                                    <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900" onClick={handleReset}>
                                        <RefreshCw className="w-4 h-4 mr-2" /> Chấm bài khác
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
