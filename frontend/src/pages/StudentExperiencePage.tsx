import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Zap, Target, BookOpen, CheckCircle, Lock } from 'lucide-react';

type AssignmentStatus = 'completed' | 'in_progress' | 'pending' | 'locked';

interface ParentClassInfo {
    class_id: number;
}

interface TopicProgress {
    topic: string;
    status: 'mastered' | 'practicing' | 'started';
    percent: number;
}

interface TodayAssignment {
    id: number;
    title: string;
    topic: string;
    status: AssignmentStatus;
    correct: number;
    total: number;
}

interface ParentDashboardData {
    student_name: string;
    stats: {
        completed: number;
        study_time: number;
        avg_score: number;
        accuracy: number;
    };
    topic_progress: TopicProgress[];
    today_assignments: TodayAssignment[];
}

export default function StudentExperiencePage() {
    const [dashboard, setDashboard] = useState<ParentDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudentView = async () => {
            try {
                const classesRes = await fetch('/api/parent/classes', {
                    credentials: 'include',
                });

                if (!classesRes.ok) {
                    throw new Error('Không thể tải danh sách lớp của phụ huynh.');
                }

                const classesData: ParentClassInfo[] = await classesRes.json();
                if (!classesData.length) {
                    setDashboard(null);
                    return;
                }

                const activeClassId = classesData[0].class_id;
                const dashboardRes = await fetch(`/api/parent/dashboard/${activeClassId}`, {
                    credentials: 'include',
                });

                if (!dashboardRes.ok) {
                    throw new Error('Không thể tải dữ liệu học tập của học sinh.');
                }

                const dashboardData: ParentDashboardData = await dashboardRes.json();
                setDashboard(dashboardData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu học sinh.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentView();
    }, []);

    const studentName = useMemo(() => {
        if (!dashboard?.student_name) {
            return 'Học sinh';
        }
        const nameParts = dashboard.student_name.trim().split(' ');
        return nameParts[nameParts.length - 1] || dashboard.student_name;
    }, [dashboard]);

    const getTaskStatusIcon = (status: AssignmentStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in_progress':
                return <BookOpen className="w-5 h-5 text-blue-500" />;
            case 'pending':
            case 'locked':
                return <Lock className="w-5 h-5 text-gray-400" />;
            default:
                return null;
        }
    };

    const getPathStatus = (status: TopicProgress['status']) => {
        switch (status) {
            case 'mastered':
                return <span className="text-green-500">✓</span>;
            case 'practicing':
                return <span className="text-blue-500 font-bold">●</span>;
            case 'started':
                return <Lock className="w-4 h-4 text-gray-400" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="glass-panel rounded-2xl p-8 max-w-lg text-center">
                    <h2 className="text-xl font-bold text-rose-700 mb-2">Không tải được dữ liệu</h2>
                    <p className="text-rose-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="glass-panel rounded-2xl p-8 max-w-lg text-center">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa có dữ liệu học tập</h2>
                    <p className="text-slate-600">Phụ huynh chưa kết nối học sinh vào lớp hoặc chưa có bài tập nào được giao.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans py-8">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />

            <div className="max-w-lg mx-auto px-4 relative z-10">
                <div className="mb-6 flex items-center gap-3">
                    <Link to="/parent" className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-white hover:text-indigo-600 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang phụ huynh
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 drop-shadow-sm animate-bounce">👋</div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Xin chào {studentName}!</h1>
                    <p className="text-slate-500 font-medium mt-1">Hãy cùng học toán vui vẻ nhé</p>
                </div>

                <div className="glass-panel bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 mb-8 text-white text-center shadow-soft">
                    <h3 className="font-extrabold text-xl mb-1 drop-shadow-sm">Làm tốt lắm!</h3>
                    <p className="font-medium text-white/90">Con đã hoàn thành {dashboard.stats.completed} bài đã giao</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="glass-panel border-white/50 rounded-2xl p-5 shadow-sm text-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-800">{Math.max(0, Math.round(dashboard.stats.avg_score * 10))}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">điểm x10</p>
                    </div>
                    <div className="glass-panel border-white/50 rounded-2xl p-5 shadow-sm text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-800">{dashboard.stats.study_time}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">lượt làm</p>
                    </div>
                    <div className="glass-panel border-white/50 rounded-2xl p-5 shadow-sm text-center">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-800">{dashboard.stats.accuracy}%</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">làm đúng</p>
                    </div>
                </div>

                <div className="glass-panel border-white/50 rounded-3xl p-6 shadow-soft mb-8">
                    <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <span className="text-xl drop-shadow-sm">Nhiệm vụ hôm nay</span>
                    </h2>
                    <div className="space-y-4">
                        {dashboard.today_assignments.length === 0 && (
                            <p className="text-slate-500 text-sm">Chưa có bài tập được giao hôm nay.</p>
                        )}
                        {dashboard.today_assignments.map((task) => (
                            <div key={task.id} className="p-5 rounded-2xl bg-white/70 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white rounded-full p-2 shadow-sm">
                                            {getTaskStatusIcon(task.status)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-base">{task.title}</p>
                                            <p className="text-sm font-medium text-slate-500 mt-0.5">{task.correct}/{task.total} câu</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                                        {task.topic}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel border-white/50 rounded-3xl p-6 shadow-soft">
                    <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <span className="text-xl drop-shadow-sm">Lộ trình học tập</span>
                    </h2>
                    <div className="space-y-4">
                        {dashboard.topic_progress.length === 0 && (
                            <p className="text-slate-500 text-sm">Chưa có dữ liệu tiến độ chủ đề.</p>
                        )}
                        {dashboard.topic_progress.map((item, index) => (
                            <div key={`${item.topic}-${index}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        {getPathStatus(item.status)}
                                    </div>
                                    <span className="font-semibold text-slate-700">{item.topic}</span>
                                </div>
                                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                                    {item.percent}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
