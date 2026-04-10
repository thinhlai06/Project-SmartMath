import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Users } from 'lucide-react';
import { classApi, type MathClass } from '@/services/classApi';

interface WeakTopic {
    topic: string;
    accuracy: number;
    total_questions: number;
}

interface StudentPerformance {
    student: string;
    average_score: number;
    assignment_count: number;
}

interface MistakePattern {
    type: string;
    count: number;
}

interface AnalyticsResponse {
    weak_topics: WeakTopic[];
    student_performance: StudentPerformance[];
    common_mistakes: MistakePattern[];
}

export default function ErrorAnalyticsPage() {
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [classLoading, setClassLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);

    // Fetch Classes
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
                console.error("Failed to fetch classes", error);
            } finally {
                setClassLoading(false);
            }
        };
        fetchClasses();
    }, []);

    // Fetch Analytics when class changes
    useEffect(() => {
        if (!selectedClassId) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            setAnalyticsError(null);
            try {
                const res = await fetch(`/api/ai/analytics/${selectedClassId}`, {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(`Lỗi tải thống kê: HTTP ${res.status}`);
                const data = await res.json();
                setAnalytics(data);
            } catch (error: any) {
                console.error(error);
                setAnalyticsError(error?.message || 'Không thể tải dữ liệu phân tích.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedClassId]);

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
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Phân tích lỗi sai</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Thống kê chi tiết kết quả học tập và các lỗi phổ biến của học sinh.
                        </p>
                    </div>

                    <div className="w-[240px]">
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

                {analyticsError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-semibold text-red-700 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        {analyticsError}
                    </div>
                )}

                {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin drop-shadow-sm"></div>
                    </div>
            ) : analytics && (analytics.weak_topics.length > 0 || analytics.common_mistakes.length > 0 || analytics.student_performance.length > 0) ? (
                <div className="space-y-6">
                    {/* Top Row: Weak Topics & Mistakes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Weak Topics Chart */}
                        <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                            <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-800">Chủ đề cần cải thiện</CardTitle>
                                </div>
                                <CardDescription className="text-slate-500 font-medium ml-13">Các chủ đề có tỉ lệ làm đúng dưới 70%</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] min-h-[300px] min-w-[320px] p-6">
                                {analytics.weak_topics.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.weak_topics} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                            <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                                            <YAxis dataKey="topic" type="category" width={100} tick={{ fontSize: 13, fontWeight: 500, fill: '#475569' }} stroke="#94a3b8" />
                                            <Tooltip
                                                formatter={(value: any) => [`${value}%`, 'Độ chính xác']}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                            />
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

                        {/* Common Mistakes */}
                        <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                            <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-800">Lỗi sai phổ biến</CardTitle>
                                </div>
                                <CardDescription className="text-slate-500 font-medium ml-13">Tần suất các loại lỗi gặp phải</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {analytics.common_mistakes.length > 0 ? (
                                    <div className="space-y-4">
                                        {analytics.common_mistakes.map((mistake, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-orange-50/80 rounded-2xl border border-orange-100/50 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                                <span className="font-semibold text-slate-800 capitalize">{mistake.type.replace(/_/g, " ")}</span>
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

                    {/* Bottom Row: Student Performance */}
                    <Card className="glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                        <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-indigo-500" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800">Kết quả học sinh</CardTitle>
                            </div>
                            <CardDescription className="text-slate-500 font-medium ml-13">Điểm trung bình và số bài tập đã làm</CardDescription>
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
            ) : analytics && !analyticsError ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-panel border-white/50 rounded-3xl shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Chưa có dữ liệu thống kê</h3>
                    <p className="text-slate-500 font-medium max-w-md mx-auto mb-6">
                        Lớp học này chưa có dữ liệu phân tích lỗi. Hãy sử dụng tính năng Chấm điểm AI và lưu kết quả duyệt để bắt đầu theo dõi.
                    </p>
                    <a href="/ai-grading" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors">
                        Đến trang Chấm điểm AI
                    </a>
                </div>
            ) : null}
            </div>
        </div>
    );
}
