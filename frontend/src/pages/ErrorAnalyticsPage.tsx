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

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classApi.getClasses();
                setClasses(data);
                if (data.length > 0) {
                    setSelectedClassId(data[0].id.toString());
                }
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };
        fetchClasses();
    }, []);

    // Fetch Analytics when class changes
    useEffect(() => {
        if (!selectedClassId) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/ai/analytics/${selectedClassId}`, {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const data = await res.json();
                setAnalytics(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedClassId]);

    if (!classes.length) {
        return <div className="p-8 text-center text-gray-500">Đang tải danh sách lớp học...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Phân tích lỗi sai</h1>
                    <p className="text-gray-500 mt-1">
                        Thống kê kết quả học tập và các lỗi phổ biến của học sinh.
                    </p>
                </div>

                <div className="w-[200px]">
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn lớp học" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                    {cls.class_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : analytics ? (
                <div className="space-y-6">
                    {/* Top Row: Weak Topics & Mistakes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Weak Topics Chart */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <CardTitle>Chủ đề yếu nhất</CardTitle>
                                </div>
                                <CardDescription>Các chủ đề có tỉ lệ làm đúng thấp (dưới 70%)</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] min-h-[300px] min-w-[320px]">
                                {analytics.weak_topics.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.weak_topics} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="topic" type="category" width={100} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value: any) => [`${value}%`, 'Độ chính xác']} />
                                            <Bar dataKey="accuracy" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20}>
                                                {analytics.weak_topics.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.accuracy < 50 ? '#ef4444' : '#f97316'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        Chưa có dữ liệu chủ đề yếu
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Common Mistakes */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-orange-500" />
                                    <CardTitle>Lỗi sai phổ biến</CardTitle>
                                </div>
                                <CardDescription>Tần suất các loại lỗi gặp phải</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {analytics.common_mistakes.length > 0 ? (
                                    <div className="space-y-4">
                                        {analytics.common_mistakes.map((mistake, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                                <span className="font-medium text-gray-800 capitalize">{mistake.type.replace(/_/g, " ")}</span>
                                                <Badge variant="secondary" className="bg-white text-orange-600 font-bold border-orange-200">
                                                    {mistake.count} lần
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-[250px] flex items-center justify-center text-gray-400">
                                        Chưa có dữ liệu lỗi sai
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Row: Student Performance */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <CardTitle>Kết quả học sinh</CardTitle>
                            </div>
                            <CardDescription>Điểm trung bình và số bài tập đã làm</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Học sinh</TableHead>
                                        <TableHead>Điểm trung bình</TableHead>
                                        <TableHead>Số bài tập</TableHead>
                                        <TableHead>Đánh giá</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics.student_performance.map((student) => (
                                        <TableRow key={student.student}>
                                            <TableCell className="font-medium">{student.student}</TableCell>
                                            <TableCell>
                                                <span className={`font-bold ${student.average_score >= 8 ? 'text-green-600' : student.average_score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {student.average_score}
                                                </span>
                                            </TableCell>
                                            <TableCell>{student.assignment_count}</TableCell>
                                            <TableCell>
                                                {student.average_score >= 8 ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Giỏi</Badge>
                                                ) : student.average_score >= 5 ? (
                                                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Khá/TB</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cần cố gắng</Badge>
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
                <div className="text-center py-12 text-gray-500">
                    Chọn lớp học để xem phân tích
                </div>
            )}
        </div>
    );
}
