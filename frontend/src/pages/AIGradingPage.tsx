import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GradeResult {
    question_id: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    score: number;
    max_score: number;
    question_text?: string;
    question_type?: string;
    reasoning?: string;
    feedback?: string;
}

interface GradingResponse {
    total_score: number;
    max_score: number;
    results: GradeResult[];
    raw_text: string;
    extracted_json?: Record<string, string>;
}

export default function AIGradingPage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [correctAnswersJson, setCorrectAnswersJson] = useState<string>("");
    const [gradingResult, setGradingResult] = useState<GradingResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleGrade = async () => {
        if (!file) return;

        // Validate JSON only if provided
        if (correctAnswersJson.trim()) {
            try {
                JSON.parse(correctAnswersJson);
            } catch (e) {
                setError("Invalid JSON format for Correct Answers");
                return;
            }
        }

        setStep('processing');
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        if (correctAnswersJson.trim()) {
            formData.append('correct_answers_json', correctAnswersJson);
        }

        try {
            const response = await fetch('/api/ai/grade-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Grading failed');
            }

            const data: GradingResponse = await response.json();
            setGradingResult(data);
            setStep('result');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
            setStep('upload');
        }
    };

    const handleReset = () => {
        setStep('upload');
        setFile(null);
        setPreviewUrl(null);
        setGradingResult(null);
        setError(null);
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chấm điểm AI (Beta)</h1>
                    <p className="text-muted-foreground mt-2">Tải lên ảnh bài làm và cung cấp đáp án để AI chấm điểm.</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 px-3 py-1">
                    Powered by PaddleOCR
                </Badge>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upload & Config */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Label>1. Ảnh bài làm</Label>

                            {!previewUrl ? (
                                <div
                                    onClick={handleUploadClick}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click để chọn ảnh</p>
                                </div>
                            ) : (
                                <div className="relative border rounded-lg overflow-hidden">
                                    <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain max-h-[300px]" />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            <div className="space-y-2">
                                <Label>2. Đáp án mẫu (Tùy chọn)</Label>
                                <Textarea
                                    rows={10}
                                    className="font-mono text-xs"
                                    value={correctAnswersJson}
                                    onChange={(e) => setCorrectAnswersJson(e.target.value)}
                                    placeholder='[{"id": 1, "answer": "..."}]'
                                />
                                <p className="text-xs text-muted-foreground">
                                    Để trống để AI tự động giải và chấm điểm. Hoặc nhập JSON để chấm theo đáp án của bạn.
                                </p>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleGrade}
                                disabled={!file || step === 'processing'}
                            >
                                {step === 'processing' ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Đang chấm...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" /> Chấm điểm ngay
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-2">
                    {step === 'processing' && (
                        <Card className="h-full min-h-[400px] flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="relative w-16 h-16 mx-auto">
                                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <p className="text-lg font-medium">AI đang tự giải bài toán và chấm điểm...</p>
                                <p className="text-sm text-muted-foreground">Quá trình này có thể mất vài giây</p>
                            </div>
                        </Card>
                    )}

                    {step === 'result' && gradingResult && (
                        <Card className="h-full">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">Kết quả chi tiết</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Dựa trên {gradingResult.results.length} câu hỏi
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-green-600">
                                            {gradingResult.total_score} <span className="text-lg text-gray-400">/ {gradingResult.max_score}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {gradingResult.results.map((res, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border ${res.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">Câu {res.question_id}</span>
                                                        {res.question_type && (
                                                            <Badge variant="outline" className="text-xs">{res.question_type}</Badge>
                                                        )}
                                                        {res.is_correct ? (
                                                            <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                                        ) : (
                                                            <Badge variant="destructive">Sai</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Học sinh trả lời:</span> "{res.student_answer || "(Trống)"}"
                                                    </p>

                                                    <p className="text-sm text-green-700 font-medium">
                                                        Đáp án đúng: "{res.correct_answer}"
                                                    </p>

                                                    {/* Reasoning & Feedback */}
                                                    {(res.reasoning || res.feedback) && (
                                                        <div className="mt-2 text-xs text-gray-600 bg-white/50 p-2 rounded">
                                                            {res.reasoning && <p><strong>Giải thích:</strong> {res.reasoning}</p>}
                                                            {res.feedback && <p className="mt-1 text-red-600"><strong>Nhận xét:</strong> {res.feedback}</p>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-lg">
                                                    {res.score}/{res.max_score}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h4 className="font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> OCR Raw Text
                                    </h4>
                                    <pre className="text-xs whitespace-pre-wrap text-gray-600 bg-white p-2 rounded border max-h-40 overflow-y-auto">
                                        {gradingResult.raw_text}
                                    </pre>
                                </div>

                                <Button onClick={handleReset} variant="outline" className="w-full">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Chấm bài khác
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 'upload' && !file && (
                        <div className="h-full flex items-center justify-center p-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                            <div className="text-center">
                                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>Kết quả chấm điểm sẽ hiển thị ở đây</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
