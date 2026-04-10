import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle, RefreshCw, FileText } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GradingDiffViewer } from '@/components/redesign';
import { AnswerBuilder, toAnswerKeyPayload, type AnswerBuilderEntry } from '@/components/ai/AnswerBuilder';
import aiApi from '@/services/aiApi';
import type { AnalyticsTagItem, GradeResult, GradingResponse } from '@/types/ai';
import { classApi, type MathClass } from '@/services/classApi';

interface OCRDiffState {
    resultIndex: number;
    ocrText: string;
    expectedText: string;
}

export default function AIGradingPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [answerKeyEntries, setAnswerKeyEntries] = useState<AnswerBuilderEntry[]>([]);
    const [gradingResult, setGradingResult] = useState<GradingResponse | null>(null);
    const [ocrDiff, setOcrDiff] = useState<OCRDiffState | null>(null);
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [analyticsNotice, setAnalyticsNotice] = useState<string | null>(null);
    const [isSubmittingAnalytics, setIsSubmittingAnalytics] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const buildErrorTags = (results: GradeResult[]): AnalyticsTagItem[] => {
        const mistakeCounter = results.reduce<Record<string, number>>((acc, item) => {
            if (item.is_correct) {
                return acc;
            }

            const normalizedType = (item.question_type || 'khac').trim().toLowerCase().replace(/\s+/g, '_');
            acc[normalizedType] = (acc[normalizedType] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(mistakeCounter).map(([error_type, count]) => ({
            error_type,
            count,
        }));
    };

    const extractFirstNumber = (value: string): number | null => {
        const matches = value.match(/-?\d+(?:[\.,]\d+)?/);
        if (!matches || matches.length === 0) {
            return null;
        }

        const parsed = Number(matches[0].replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : null;
    };

    const isOverrideCorrect = (item: GradeResult, correctedText: string): boolean => {
        const normalizedType = (item.question_type || '').trim().toLowerCase();
        const studentText = correctedText.trim();
        const expectedText = item.correct_answer.trim();

        if (normalizedType === 'number' || normalizedType === 'numeric') {
            const studentNumber = extractFirstNumber(studentText);
            const expectedNumber = extractFirstNumber(expectedText);

            if (studentNumber !== null && expectedNumber !== null) {
                return Math.abs(studentNumber - expectedNumber) < 1e-9;
            }
        }

        return studentText === expectedText;
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classList = await classApi.getClasses();
                setClasses(classList);
                if (classList.length > 0) {
                    setSelectedClassId(classList[0].id.toString());
                }
            } catch (fetchError) {
                console.error('Khong the tai danh sach lop:', fetchError);
            }
        };

        fetchClasses();
    }, []);

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

    const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleGrade = async () => {
        if (!file) return;

        setStep('processing');
        setError(null);
        setAnalyticsNotice(null);

        try {
            const correctAnswersPayload = answerKeyEntries.length > 0
                ? JSON.stringify(toAnswerKeyPayload(answerKeyEntries))
                : undefined;

            const data: GradingResponse = await aiApi.gradeImage(file, correctAnswersPayload);
            setGradingResult(data);

            const errorTags = buildErrorTags(data.results);
            if (!selectedClassId) {
                setAnalyticsNotice('Vui long chon lop hoc truoc khi luu thong ke da duyet.');
            } else if (errorTags.length === 0) {
                setAnalyticsNotice('Khong co loi sai de cap nhat thong ke.');
            } else {
                setAnalyticsNotice('Da co ket qua nhap. Vui long review/override roi bam "Luu thong ke da duyet".');
            }

            const firstIncorrectIndex = data.results.findIndex((item) => !item.is_correct);
            if (firstIncorrectIndex >= 0) {
                setOcrDiff({
                    resultIndex: firstIncorrectIndex,
                    ocrText: data.results[firstIncorrectIndex].student_answer,
                    expectedText: data.results[firstIncorrectIndex].correct_answer,
                });
            } else {
                setOcrDiff(null);
            }
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
        setOcrDiff(null);
        setAnalyticsNotice(null);
        setError(null);
    };

    const handleOverride = (correctedText: string) => {
        if (!gradingResult || !ocrDiff) {
            return;
        }

        const updatedResults = gradingResult.results.map((item, index) => {
            if (index !== ocrDiff.resultIndex) {
                return item;
            }

            const isCorrect = isOverrideCorrect(item, correctedText);
            return {
                ...item,
                student_answer: correctedText,
                is_correct: isCorrect,
                score: isCorrect ? item.max_score : item.score,
                feedback: isCorrect ? 'Giáo viên đã xác nhận kết quả OCR.' : item.feedback,
            };
        });

        const recalculatedTotal = updatedResults.reduce((sum, item) => sum + item.score, 0);
        setGradingResult({
            ...gradingResult,
            results: updatedResults,
            total_score: recalculatedTotal,
        });
        setOcrDiff(null);
        const refreshedErrorTags = buildErrorTags(updatedResults);
        if (refreshedErrorTags.length === 0) {
            setAnalyticsNotice('Da cap nhat ket qua review. Khong con loi sai de luu thong ke.');
        } else {
            setAnalyticsNotice('Da cap nhat ket qua review. Bam "Luu thong ke da duyet" de dong bo dashboard.');
        }
    };

    const handleSubmitReviewedAnalytics = async () => {
        if (!gradingResult) {
            return;
        }

        if (!selectedClassId) {
            setAnalyticsNotice('Vui long chon lop hoc truoc khi luu thong ke.');
            return;
        }

        const errorTags = buildErrorTags(gradingResult.results);
        if (errorTags.length === 0) {
            setAnalyticsNotice('Khong co loi sai de cap nhat thong ke.');
            return;
        }

        try {
            setIsSubmittingAnalytics(true);
            const submitResult = await aiApi.submitAnalytics({
                class_id: Number(selectedClassId),
                source: 'teacher_review',
                error_tags: errorTags,
            });
            setAnalyticsNotice(`Da luu ${submitResult.records_created} nhom loi vao dashboard.`);
        } catch (submitError) {
            console.error('Khong the luu analytics da duyet:', submitError);
            setAnalyticsNotice('Khong the luu thong ke da duyet. Vui long thu lai.');
        } finally {
            setIsSubmittingAnalytics(false);
        }
    };

    const getResultConfidence = (result: GradeResult): number => {
        if (typeof result.ocr_confidence === 'number') {
            return result.ocr_confidence;
        }
        return gradingResult?.ocr_avg_confidence ?? 0;
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans p-6">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="container mx-auto max-w-5xl space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Chấm điểm AI (Beta)</h1>
                        <p className="text-slate-500 font-medium mt-2">Tải lên ảnh bài làm và cung cấp đáp án để AI chấm điểm ngoài giờ.</p>
                    </div>
                    <Badge className="bg-purple-100/80 text-purple-700 hover:bg-purple-200 px-4 py-1.5 text-sm font-semibold rounded-xl">
                        Powered by GLM-OCR
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
                    <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                        <CardContent className="p-6 space-y-6">
                            <Label className="text-slate-700 font-bold mb-3 block text-base">1. Ảnh bài làm</Label>

                            {!previewUrl ? (
                                <button
                                    type="button"
                                    onClick={handleUploadClick}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className={`w-full rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 [touch-action:manipulation] select-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                                        isDragging ? 'border-indigo-400 bg-indigo-50/50 scale-105' : 'border-slate-300 hover:border-indigo-400 hover:bg-white/50'
                                    }`}
                                    aria-label="Tải ảnh bài làm"
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">Kéo thả hoặc click để chọn ảnh</p>
                                </button>
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

                            <div className="space-y-3 pt-4 border-t border-slate-200/50">
                                <Label className="text-slate-700 font-bold block text-base">2. Lop hoc</Label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                >
                                    {classes.length === 0 ? (
                                        <option value="">Chua co lop hoc de luu thong ke</option>
                                    ) : (
                                        classes.map((cls) => (
                                            <option key={cls.id} value={cls.id.toString()}>
                                                {cls.class_name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-200/50">
                                <AnswerBuilder value={answerKeyEntries} onChange={setAnswerKeyEntries} />
                            </div>

                            <Button
                                className="w-full rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-soft text-base transition-all"
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
                        <Card className="h-full min-h-[500px] flex items-center justify-center glass-panel border-white/50 rounded-3xl shadow-soft">
                            <div className="text-center space-y-6">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin drop-shadow-sm"></div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-800">AI đang tự giải bài toán và chấm điểm...</p>
                                    <p className="text-sm font-medium text-slate-500 mt-2">Quá trình này có thể mất vài giây</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {step === 'result' && gradingResult && (
                        <Card className="h-full glass-panel border-white/50 rounded-3xl shadow-soft overflow-hidden">
                            <CardContent className="p-8 space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kết quả chi tiết</h2>
                                        <p className="text-sm font-medium text-slate-500 mt-1">
                                            Dựa trên {gradingResult.results.length} câu hỏi
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500 mt-1">
                                            OCR tin cậy trung bình: {(gradingResult.ocr_avg_confidence ?? 0).toFixed(1)}%
                                        </p>
                                        {analyticsNotice && (
                                            <p className="text-xs font-semibold text-indigo-600 mt-2">{analyticsNotice}</p>
                                        )}
                                        <div className="mt-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-9"
                                                onClick={handleSubmitReviewedAnalytics}
                                                disabled={isSubmittingAnalytics || !selectedClassId}
                                            >
                                                {isSubmittingAnalytics ? 'Dang luu...' : 'Luu thong ke da duyet'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-green-600">
                                            {gradingResult.total_score} <span className="text-lg text-gray-400">/ {gradingResult.max_score}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {gradingResult.results.map((res, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border ${res.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} ${getResultConfidence(res) < 85 ? 'ring-1 ring-red-300' : ''}`}>
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
                                                        <Badge variant="outline" className={getResultConfidence(res) < 85 ? 'border-red-300 text-red-600' : 'border-emerald-300 text-emerald-700'}>
                                                            OCR {getResultConfidence(res).toFixed(1)}%
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Học sinh trả lời:</span> "{res.student_answer || "(Trống)"}"
                                                    </p>

                                                    <p className="text-sm text-green-700 font-medium">
                                                        Đáp án đúng: "{res.correct_answer}"
                                                    </p>

                                                    {!!res.low_confidence_tokens?.length && (
                                                        <div className="mt-2 text-xs rounded-md border border-red-200 bg-red-50 p-2">
                                                            <p className="font-semibold text-red-700">Từ OCR độ tin cậy thấp:</p>
                                                            <div className="mt-1 flex flex-wrap gap-2">
                                                                {res.low_confidence_tokens.map((token, tokenIndex) => (
                                                                    <span key={`${token.text}-${tokenIndex}`} className="rounded bg-red-100 px-2 py-0.5 text-red-700">
                                                                        {token.text} ({token.confidence.toFixed(1)}%)
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

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

                                {ocrDiff && (
                                    <GradingDiffViewer
                                        ocrText={ocrDiff.ocrText}
                                        expectedText={ocrDiff.expectedText}
                                        confidenceScore={getResultConfidence(gradingResult.results[ocrDiff.resultIndex])}
                                        onOverride={handleOverride}
                                    />
                                )}

                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <h4 className="font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> OCR Raw Text
                                    </h4>
                                    <pre className="text-xs whitespace-pre-wrap text-gray-600 bg-white p-2 rounded border max-h-40 overflow-y-auto">
                                        {gradingResult.raw_text}
                                    </pre>
                                </div>

                                <Button onClick={handleReset} variant="outline" className="w-full rounded-xl h-12 font-semibold hover:bg-slate-100 text-slate-700">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Chấm bài khác
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 'upload' && !file && (
                        <div className="h-full flex items-center justify-center p-12 text-slate-400 bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200/60 shadow-inner">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-10 w-10 text-slate-300" />
                                </div>
                                <p className="font-medium">Kết quả chấm điểm sẽ hiển thị ở đây</p>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
}
