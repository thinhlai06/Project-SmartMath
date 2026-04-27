import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle, RefreshCw, FileText, Save } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GradingDiffViewer } from '@/components/redesign';
import { AnswerBuilder, toAnswerKeyPayload, type AnswerBuilderEntry } from '@/components/ai/AnswerBuilder';
import aiApi from '@/services/aiApi';
import type { AnalyticsTagItem, GradeResult, GradingResponse } from '@/types/ai';
import { classApi, studentApi, type MathClass, type Student } from '@/services/classApi';
import { worksheetApi, type Worksheet } from '@/services/worksheetApi';
import { gradebookApi } from '@/services/gradebookApi';
import { useToast } from '@/components/ui/toast';

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
    const { toast } = useToast();
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
    const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>('');
    const [analyticsNotice, setAnalyticsNotice] = useState<string | null>(null);
    const [isSavingGrade, setIsSavingGrade] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const normalizeErrorType = (value?: string): string => {
        const normalized = (value || '').trim().toLowerCase().replace(/\s+/g, '_');
        return normalized || 'khac';
    };

    const buildErrorTags = (results: GradeResult[]): AnalyticsTagItem[] => {
        return results
            .filter((item) => !item.is_correct)
            .map((item) => ({
                error_type: normalizeErrorType(item.error_type || item.question_type),
                count: 1,
                question_id: item.question_id,
                ocr_confidence: item.ocr_confidence,
                error_detail: item.error_detail || item.feedback,
                student_answer: item.student_answer,
                correct_answer: item.correct_answer,
                question_text: item.question_text,
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

    useEffect(() => {
        const loadClassDetails = async () => {
            if (!selectedClassId) {
                setStudents([]);
                setWorksheets([]);
                setSelectedStudentId('');
                setSelectedWorksheetId('');
                return;
            }
            // Reset dependent selections before loading new data
            setSelectedStudentId('');
            setSelectedWorksheetId('');
            try {
                const [studentsData, worksheetsData] = await Promise.all([
                    studentApi.getStudents(Number(selectedClassId)),
                    worksheetApi.getWorksheets(Number(selectedClassId), 'published')
                ]);
                setStudents(studentsData);
                setWorksheets(worksheetsData);
                // Do NOT auto-select — force teacher to explicitly choose
            } catch (err) {
                console.error('Error loading class details', err);
            }
        };
        loadClassDetails();
    }, [selectedClassId]);

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
                setAnalyticsNotice('Vui lòng chọn lớp học để lưu thống kê.');
            } else if (errorTags.length === 0) {
                setAnalyticsNotice('Không có lỗi sai để cập nhật thống kê.');
            } else {
                setAnalyticsNotice('Đã có kết quả. Xem xét câu sai bên dưới rồi nhấn "Lưu điểm vào sổ".');
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
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi chấm điểm';
            console.error(err);
            setError(msg);
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
                error_type: isCorrect ? undefined : item.error_type,
                error_detail: isCorrect ? undefined : item.error_detail,
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
            setAnalyticsNotice('Đã cập nhật kết quả. Không còn lỗi sai.');
        } else {
            setAnalyticsNotice('Đã cập nhật kết quả. Nhấn "Lưu điểm vào sổ" để đồng bộ.');
        }
    };

    const handleSubmitReviewedAnalytics = async () => {
        if (!gradingResult) return;

        if (!selectedClassId || !selectedStudentId || !selectedWorksheetId) {
            setAnalyticsNotice('Vui lòng chọn đủ Lớp, Học sinh và Bài tập trước khi lưu điểm.');
            return;
        }

        try {
            setIsSavingGrade(true);

            const correctCount = gradingResult.results.filter((item) => item.is_correct).length;
            const totalCount = gradingResult.results.length;
            
            // Calculate score assuming max is 10 if standard 10-point scale desired
            // For simplicity, we just use the calculated ratio out of 10 if max_score varies
            let finalScore = gradingResult.total_score;
            if (gradingResult.max_score > 0 && gradingResult.max_score !== 10) {
                finalScore = (gradingResult.total_score / gradingResult.max_score) * 10;
            }
            
            // Round to 1 decimal place
            finalScore = Math.round(finalScore * 10) / 10;

            await gradebookApi.saveGrade(Number(selectedStudentId), Number(selectedWorksheetId), finalScore, {
                correct_count: correctCount,
                total_count: totalCount,
                details: {
                    source: 'ai_grading_teacher_review',
                    max_score: gradingResult.max_score,
                },
            });
            
            toast(`Đã lưu ${finalScore} điểm cho học sinh.`, "success");
            
            // Optionally save analytics in the background
            const errorTags = buildErrorTags(gradingResult.results);
            if (errorTags.length > 0) {
                aiApi.submitAnalytics({
                    class_id: Number(selectedClassId),
                    student_id: Number(selectedStudentId),
                    worksheet_id: Number(selectedWorksheetId),
                    source: 'teacher_review',
                    error_tags: errorTags,
                }).catch(e => console.error("Analytics save failed", e));
            }
            
            setAnalyticsNotice(`Đã lưu ${finalScore} điểm vào sổ điểm.`);
        } catch (submitError) {
            console.error('Không thể lưu điểm:', submitError);
            setAnalyticsNotice('Lỗi khi lưu điểm. Vui lòng thử lại.');
            toast("Không thể lưu điểm. Vui lòng thử lại.", "error");
        } finally {
            setIsSavingGrade(false);
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
                        Powered by Gemma4 Cloud Vision
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
                                <label
                                    htmlFor="grading-file-input"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                            const selectedFile = e.dataTransfer.files[0];
                                            setFile(selectedFile);
                                            setPreviewUrl(URL.createObjectURL(selectedFile));
                                            setError(null);
                                        }
                                    }}
                                    className={`w-full rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 block select-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                                        isDragging ? 'border-indigo-400 bg-indigo-50/50 scale-105' : 'border-slate-300 hover:border-indigo-400 hover:bg-white/50'
                                    }`}
                                    aria-label="Tải ảnh bài làm"
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">Kéo thả hoặc click để chọn ảnh</p>
                                </label>
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
                                id="grading-file-input"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            <div className="space-y-3 pt-4 border-t border-slate-200/50">
                                <Label className="text-slate-700 font-bold block text-base">2. Lớp học</Label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                >
                                    <option value="">-- Chọn lớp học --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id.toString()}>
                                            {cls.class_name}
                                        </option>
                                    ))}
                                </select>
                                
                                {selectedClassId && (
                                    <>
                                        <Label className="text-slate-700 font-bold block text-base pt-2">Học sinh</Label>
                                        <select
                                            className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                                            value={selectedStudentId}
                                            onChange={(e) => setSelectedStudentId(e.target.value)}
                                        >
                                            <option value="">-- Chọn học sinh --</option>
                                            {students.map((stu) => (
                                                <option key={stu.id} value={stu.id.toString()}>
                                                    {stu.full_name}
                                                </option>
                                            ))}
                                        </select>
                                        
                                        <Label className="text-slate-700 font-bold block text-base pt-2">Bài tập</Label>
                                        <select
                                            className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                                            value={selectedWorksheetId}
                                            onChange={(e) => setSelectedWorksheetId(e.target.value)}
                                        >
                                            <option value="">-- Chọn bài tập --</option>
                                            {worksheets.map((ws) => (
                                                <option key={ws.id} value={ws.id.toString()}>
                                                    {ws.title}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
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
                                                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                onClick={handleSubmitReviewedAnalytics}
                                                disabled={isSavingGrade || !selectedClassId || !selectedStudentId || !selectedWorksheetId}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {isSavingGrade ? 'Đang lưu...' : 'Lưu điểm vào sổ'}
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

                                                    {!res.is_correct && (res.error_type || res.error_detail) && (
                                                        <div className="mt-2 text-xs rounded-md border border-amber-200 bg-amber-50 p-2">
                                                            {res.error_type && (
                                                                <p className="font-semibold text-amber-700">
                                                                    Loại lỗi: {res.error_type.replace(/_/g, ' ')}
                                                                </p>
                                                            )}
                                                            {res.error_detail && (
                                                                <p className="mt-1 text-amber-800">{res.error_detail}</p>
                                                            )}
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
