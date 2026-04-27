import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Pencil, Save, Trash2, TrendingUp, Users, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import aiApi from '@/services/aiApi';
import { classApi, studentApi, type MathClass, type Student } from '@/services/classApi';
import type { AnalyticsResponse, StudentErrorDetail } from '@/types/ai';

const ERROR_TYPE_OPTIONS = [
    'tinh_sai',
    'nham_phep_tinh',
    'thieu_don_vi',
    'sai_loi_giai',
    'doc_de_sai',
    'viet_sai_so',
    'bo_sot_cau',
    'khac',
];

interface EditState {
    id: number;
    error_type: string;
    error_detail: string;
}

export default function ErrorAnalyticsPage() {
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [studentErrors, setStudentErrors] = useState<StudentErrorDetail[]>([]);

    const [classLoading, setClassLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [errorsLoading, setErrorsLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [errorsError, setErrorsError] = useState<string | null>(null);

    const [editState, setEditState] = useState<EditState | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            setClassLoading(true);
            try {
                const data = await classApi.getClasses();
                setClasses(data);
                if (data.length > 0) {
                    setSelectedClassId(data[0].id.toString());
                }
            } catch (error) {
                console.error('Failed to fetch classes', error);
                setAnalyticsError('Không thể tải danh sách lớp học.');
            } finally {
                setClassLoading(false);
            }
        };

        fetchClasses();
    }, []);

    useEffect(() => {
        const loadClassData = async () => {
            if (!selectedClassId) {
                setAnalytics(null);
                setStudents([]);
                setStudentErrors([]);
                return;
            }

            setSelectedStudentId('all');
            setSummaryLoading(true);
            setErrorsLoading(true);
            setAnalyticsError(null);
            setErrorsError(null);

            const classId = Number(selectedClassId);

            try {
                const [summary, classStudents, errors] = await Promise.all([
                    aiApi.getAnalytics(classId),
                    studentApi.getStudents(classId),
                    aiApi.getStudentErrors(classId),
                ]);
                setAnalytics(summary);
                setStudents(classStudents);
                setStudentErrors(errors.errors || []);
            } catch (error: unknown) {
                console.error(error);
                const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu phân tích.';
                setAnalyticsError(message);
                setErrorsError(message);
                setAnalytics(null);
                setStudentErrors([]);
            } finally {
                setSummaryLoading(false);
                setErrorsLoading(false);
            }
        };

        loadClassData();
    }, [selectedClassId]);

    useEffect(() => {
        const loadStudentErrors = async () => {
            if (!selectedClassId) {
                return;
            }

            setErrorsLoading(true);
            setErrorsError(null);
            try {
                const classId = Number(selectedClassId);
                const studentId = selectedStudentId === 'all' ? undefined : Number(selectedStudentId);
                const response = await aiApi.getStudentErrors(classId, studentId);
                setStudentErrors(response.errors || []);
            } catch (error: unknown) {
                console.error(error);
                const message = error instanceof Error ? error.message : 'Không thể tải lỗi sai từng học sinh.';
                setErrorsError(message);
                setStudentErrors([]);
            } finally {
                setErrorsLoading(false);
            }
        };

        if (selectedClassId) {
            loadStudentErrors();
        }
    }, [selectedClassId, selectedStudentId]);

    const groupedErrors = useMemo(() => {
        const groups: Record<string, StudentErrorDetail[]> = {};
        for (const item of studentErrors) {
            const key = item.student_name || 'Chưa gán học sinh';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        }
        return groups;
    }, [studentErrors]);

    const startEdit = (item: StudentErrorDetail) => {
        setEditState({
            id: item.id,
            error_type: item.error_type || 'khac',
            error_detail: item.error_detail || '',
        });
    };

    const cancelEdit = () => {
        setEditState(null);
    };

    const saveEdit = async () => {
        if (!editState) {
            return;
        }

        setSavingId(editState.id);
        try {
            await aiApi.updateErrorRecord(editState.id, {
                error_type: editState.error_type,
                error_detail: editState.error_detail,
            });

            setStudentErrors((prev) =>
                prev.map((item) =>
                    item.id === editState.id
                        ? {
                              ...item,
                              error_type: editState.error_type,
                              error_detail: editState.error_detail,
                          }
                        : item
                )
            );
            setEditState(null);
        } catch (error) {
            console.error(error);
            setErrorsError('Không thể cập nhật bản ghi lỗi sai.');
        } finally {
            setSavingId(null);
        }
    };

    const deleteRecord = async (id: number) => {
        const confirmed = window.confirm('Bạn có chắc muốn xóa bản ghi lỗi sai này?');
        if (!confirmed) {
            return;
        }

        setDeletingId(id);
        try {
            await aiApi.deleteErrorRecord(id);
            setStudentErrors((prev) => prev.filter((item) => item.id !== id));
            if (editState?.id === id) {
                setEditState(null);
            }
        } catch (error) {
            console.error(error);
            setErrorsError('Không thể xóa bản ghi lỗi sai.');
        } finally {
            setDeletingId(null);
        }
    };

    if (classLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans p-6">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />

            <div className="container mx-auto max-w-7xl space-y-8 relative z-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Phân tích lỗi sai</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Theo dõi lỗi sai theo lớp và theo từng học sinh để can thiệp đúng trọng tâm.
                        </p>
                    </div>

                    <div className="w-[260px]">
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger className="bg-white/80 border-slate-200 h-10 rounded-xl shadow-sm font-medium">
                                <SelectValue placeholder="Chọn lớp học" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id.toString()} className="font-medium cursor-pointer">
                                        {cls.class_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {(analyticsError || errorsError) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        {analyticsError || errorsError}
                    </div>
                )}

                <Tabs defaultValue="summary" className="space-y-4">
                    <TabsList className="bg-white/80 border border-slate-200 rounded-xl p-1">
                        <TabsTrigger value="summary" className="rounded-lg">Tổng quan</TabsTrigger>
                        <TabsTrigger value="student-errors" className="rounded-lg">Lỗi sai từng HS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-6">
                        {summaryLoading ? (
                            <div className="h-[320px] flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : analytics && (analytics.weak_topics.length > 0 || analytics.common_mistakes.length > 0 || analytics.student_performance.length > 0) ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                                        <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                                </div>
                                                <CardTitle className="text-xl font-bold text-slate-800">Chủ đề cần cải thiện</CardTitle>
                                            </div>
                                            <CardDescription className="text-slate-500 font-medium ml-13">
                                                Các chủ đề có tỉ lệ làm đúng dưới 70%
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[300px] min-h-[300px] min-w-[320px] p-6">
                                            {analytics.weak_topics.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analytics.weak_topics} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e2e8f0" />
                                                        <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                                                        <YAxis dataKey="topic" type="category" width={100} tick={{ fontSize: 13, fontWeight: 500, fill: '#475569' }} stroke="#94a3b8" />
                                                        <Tooltip formatter={(value: number | string | undefined) => [`${value ?? 0}%`, 'Độ chính xác']} />
                                                        <Bar dataKey="accuracy" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={24}>
                                                            {analytics.weak_topics.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.accuracy < 50 ? '#ef4444' : '#f97316'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                    Chưa có dữ liệu chủ đề yếu
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                                        <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                    <TrendingUp className="h-5 w-5 text-orange-500" />
                                                </div>
                                                <CardTitle className="text-xl font-bold text-slate-800">Lỗi sai phổ biến</CardTitle>
                                            </div>
                                            <CardDescription className="text-slate-500 font-medium ml-13">
                                                Tần suất các loại lỗi gặp phải
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            {analytics.common_mistakes.length > 0 ? (
                                                <div className="space-y-4">
                                                    {analytics.common_mistakes.map((mistake, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-orange-50/80 rounded-2xl border border-orange-100/50 shadow-sm">
                                                            <span className="font-semibold text-slate-800 capitalize">
                                                                {mistake.type.replace(/_/g, ' ')}
                                                            </span>
                                                            <Badge className="bg-white text-orange-600 hover:bg-white font-bold px-3 py-1 shadow-sm border border-orange-200">
                                                                {mistake.count} lần
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-[250px] flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                    Chưa có dữ liệu lỗi sai
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                                    <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-indigo-500" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-slate-800">Kết quả học sinh</CardTitle>
                                        </div>
                                        <CardDescription className="text-slate-500 font-medium ml-13">
                                            Điểm trung bình và số bài tập đã làm
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-slate-50/80">
                                                <TableRow className="hover:bg-transparent border-slate-200/60">
                                                    <TableHead className="font-bold text-slate-700 py-4 px-6">Học sinh</TableHead>
                                                    <TableHead className="font-bold text-slate-700 py-4 px-6">Điểm trung bình</TableHead>
                                                    <TableHead className="font-bold text-slate-700 py-4 px-6">Số bài tập</TableHead>
                                                    <TableHead className="font-bold text-slate-700 py-4 px-6">Đánh giá</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {analytics.student_performance.map((student) => (
                                                    <TableRow key={student.student} className="hover:bg-indigo-50/40 border-slate-100/50 transition-colors">
                                                        <TableCell className="font-semibold text-slate-800 px-6 py-4">{student.student}</TableCell>
                                                        <TableCell className="px-6 py-4">
                                                            <span className={`font-bold text-lg ${student.average_score >= 8 ? 'text-emerald-600' : student.average_score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                {student.average_score}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-6 py-4 font-medium text-slate-600">{student.assignment_count}</TableCell>
                                                        <TableCell className="px-6 py-4">
                                                            {student.average_score >= 8 ? (
                                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 font-semibold rounded-lg border border-emerald-200/50">Giỏi</Badge>
                                                            ) : student.average_score >= 5 ? (
                                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 font-semibold rounded-lg border border-amber-200/50">Khá/TB</Badge>
                                                            ) : (
                                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 font-semibold rounded-lg border border-red-200/50">Cần cố gắng</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-panel border-white/50 rounded-3xl shadow-sm">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                    <TrendingUp className="h-10 w-10 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Chưa có dữ liệu thống kê</h3>
                                <p className="text-slate-500 font-medium max-w-md mx-auto mb-6">
                                    Lớp học này chưa có dữ liệu phân tích lỗi. Hãy chấm bài và lưu kết quả duyệt để bắt đầu theo dõi.
                                </p>
                                <a href="/ai-grading" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors">
                                    Đến trang Chấm điểm AI
                                </a>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="student-errors" className="space-y-6">
                        <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                            <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                <CardTitle className="text-xl font-bold text-slate-800">Lỗi sai từng học sinh</CardTitle>
                                <CardDescription className="text-slate-500 font-medium">
                                    Lọc theo học sinh, chỉnh sửa loại lỗi hoặc mô tả lỗi ngay trên từng bản ghi.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="w-full md:w-[320px] mb-6">
                                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                        <SelectTrigger className="bg-white border-slate-200 rounded-xl h-10">
                                            <SelectValue placeholder="Lọc theo học sinh" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả học sinh</SelectItem>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    {student.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {errorsLoading ? (
                                    <div className="h-[180px] flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : studentErrors.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500 font-medium">
                                        Chưa có bản ghi lỗi sai cho bộ lọc hiện tại.
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedErrors).map(([studentName, items]) => (
                                            <div key={studentName} className="rounded-2xl border border-slate-200 bg-white/80 p-4 md:p-6 space-y-4">
                                                <h3 className="text-lg font-bold text-slate-800">{studentName}</h3>

                                                {items.map((item) => {
                                                    const isEditing = editState?.id === item.id;
                                                    return (
                                                        <div key={item.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
                                                            <p className="text-sm text-slate-700 font-medium">
                                                                {item.question_text || 'Không có nội dung câu hỏi'}
                                                            </p>

                                                            <div className="text-sm text-slate-700">
                                                                <span className="font-semibold">HS:</span> {item.student_answer || '(trống)'}
                                                            </div>
                                                            <div className="text-sm text-emerald-700">
                                                                <span className="font-semibold">Đúng:</span> {item.correct_answer || '(không có dữ liệu)'}
                                                            </div>

                                                            {!isEditing ? (
                                                                <>
                                                                    <div className="text-sm text-amber-700 font-semibold capitalize">
                                                                        Loại lỗi: {item.error_type.replace(/_/g, ' ')}
                                                                    </div>
                                                                    <div className="text-sm text-slate-700">
                                                                        {item.error_detail || 'Chưa có mô tả lỗi chi tiết.'}
                                                                    </div>

                                                                    <div className="flex items-center gap-2 pt-1">
                                                                        <Button type="button" variant="outline" className="h-8" onClick={() => startEdit(item)}>
                                                                            <Pencil className="w-4 h-4 mr-1" />
                                                                            Sửa
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            className="h-8"
                                                                            disabled={deletingId === item.id}
                                                                            onClick={() => deleteRecord(item.id)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                                            {deletingId === item.id ? 'Đang xóa...' : 'Xóa'}
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="text-xs font-semibold text-slate-600 block mb-1">Loại lỗi</label>
                                                                        <Select
                                                                            value={editState.error_type}
                                                                            onValueChange={(value) =>
                                                                                setEditState((prev) =>
                                                                                    prev ? { ...prev, error_type: value } : prev
                                                                                )
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="bg-white border-slate-200 rounded-lg h-9">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {ERROR_TYPE_OPTIONS.map((type) => (
                                                                                    <SelectItem key={type} value={type}>
                                                                                        {type.replace(/_/g, ' ')}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div>
                                                                        <label className="text-xs font-semibold text-slate-600 block mb-1">Chi tiết lỗi</label>
                                                                        <Textarea
                                                                            value={editState.error_detail}
                                                                            onChange={(e) =>
                                                                                setEditState((prev) =>
                                                                                    prev ? { ...prev, error_detail: e.target.value } : prev
                                                                                )
                                                                            }
                                                                            className="min-h-[88px] bg-white"
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <Button type="button" className="h-8" disabled={savingId === item.id} onClick={saveEdit}>
                                                                            <Save className="w-4 h-4 mr-1" />
                                                                            {savingId === item.id ? 'Đang lưu...' : 'Lưu'}
                                                                        </Button>
                                                                        <Button type="button" variant="outline" className="h-8" onClick={cancelEdit}>
                                                                            <X className="w-4 h-4 mr-1" />
                                                                            Hủy
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
