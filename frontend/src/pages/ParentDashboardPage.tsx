import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    BookOpen, Clock, Star, Target,
    FileText, Users, BookMarked,
    ChevronRight, MessageSquare
} from 'lucide-react';
import { AnnouncementList } from '../components/AnnouncementList';
import { HomeworkActionCard, ProgressChartWidget } from '@/components/redesign';

interface TopicProgress {
    topic: string;
    status: 'mastered' | 'practicing' | 'started';
    percent: number;
}

interface TodayAssignment {
    id: number;
    title: string;
    topic: string;
    status: 'completed' | 'in_progress' | 'pending';
    correct: number;
    total: number;
}

interface DashboardData {
    student_name: string;
    class_name: string;
    teacher_name: string;
    stats: {
        completed: number;
        study_time: number;
        avg_score: number;
        accuracy: number;
    };
    topic_progress: TopicProgress[];
    teacher_comment: string;
    today_assignments: TodayAssignment[];
}

// Mock data for when API is not available
const MOCK_DASHBOARD: DashboardData = {
    student_name: 'Nguyễn Văn An',
    class_name: 'Lớp 3A',
    teacher_name: 'Cô Lan',
    stats: {
        completed: 12,
        study_time: 25,
        avg_score: 8.2,
        accuracy: 85
    },
    topic_progress: [
        { topic: 'Phép chia có dư', status: 'mastered', percent: 90 },
        { topic: 'Bài toán nhiều bước', status: 'practicing', percent: 65 },
        { topic: 'Đổi đơn vị đo', status: 'started', percent: 40 },
    ],
    teacher_comment: 'Con đã có tiến bộ rõ rệt trong tuần này! Con rất tập trung và cố gắng. Hãy tiếp tục phát huy nhé!',
    today_assignments: [
        { id: 1, title: 'Phép chia có dư', topic: 'Số học', status: 'completed', correct: 5, total: 5 },
        { id: 2, title: 'Bài toán tổng hợp', topic: 'Tư duy', status: 'in_progress', correct: 3, total: 8 },
    ]
};

export default function ParentDashboardPage() {
    const { classId } = useParams<{ classId: string }>();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch(`/api/parent/dashboard/${classId}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setDashboard(data);
                } else {
                    setDashboard(MOCK_DASHBOARD);
                }
            } catch {
                setDashboard(MOCK_DASHBOARD);
            } finally {
                setIsLoading(false);
            }
        };

        if (classId) {
            fetchDashboard();
        } else {
            setDashboard(MOCK_DASHBOARD);
            setIsLoading(false);
        }
    }, [classId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'mastered':
                return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Đã nắm vững ✓</span>;
            case 'practicing':
                return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Đang luyện tập</span>;
            case 'started':
                return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Mới bắt đầu</span>;
            default:
                return null;
        }
    };

    const getProgressColor = (status: string) => {
        switch (status) {
            case 'mastered': return 'bg-green-500';
            case 'practicing': return 'bg-blue-500';
            case 'started': return 'bg-yellow-500';
            default: return 'bg-gray-300';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const data = dashboard || MOCK_DASHBOARD;
    const numberFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            👋 Xin chào, Phụ huynh {data.student_name}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Cẩm nang đồng hành cùng con học toán hiệu quả</p>
                    </div>
                </div>

                {/* Premium Banner */}
                <div className="glass-panel overflow-hidden rounded-3xl p-5 mb-8 text-white relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-90 transition-opacity group-hover:opacity-100" />
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <span className="text-2xl drop-shadow-md">💎</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg drop-shadow-sm flex items-center gap-2">
                                    Gói Premium - Đồng hành tối ưu
                                </h3>
                                <p className="text-sm text-emerald-50 font-medium mt-0.5 max-w-sm">
                                    Mở khóa giải thích chi tiết, nhận xét sâu từ AI và bài tập bổ trợ cá nhân hóa.
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <button className="bg-white text-emerald-600 px-5 py-2.5 rounded-xl font-bold shadow-soft hover:shadow-lg transition-all hover:scale-105 btn-bounce">
                                Nâng cấp ngay
                            </button>
                            <p className="text-xs text-emerald-100 mt-2 font-medium">Bản dùng thử kết thúc sau 14 ngày</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    <div className="glass-panel card-hover rounded-3xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125" />
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100/50 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                                <BookOpen className="w-6 h-6 text-blue-600 drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-800 tabular-nums drop-shadow-sm group-hover:text-blue-600 transition-colors">{numberFormatter.format(data.stats.completed)}</p>
                                <p className="text-sm font-semibold text-slate-500">Bài đã xong</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel card-hover rounded-3xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125" />
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-100/50 rounded-2xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
                                <Clock className="w-6 h-6 text-orange-600 drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-800 tabular-nums drop-shadow-sm group-hover:text-orange-600 transition-colors">{numberFormatter.format(data.stats.study_time)}<span className="text-lg">p</span></p>
                                <p className="text-sm font-semibold text-slate-500">Học hôm nay</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel card-hover rounded-3xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100/50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125" />
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-yellow-100/50 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                <Star className="w-6 h-6 text-yellow-600 drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-800 tabular-nums drop-shadow-sm group-hover:text-yellow-600 transition-colors">{numberFormatter.format(data.stats.avg_score)}</p>
                                <p className="text-sm font-semibold text-slate-500">Điểm TB</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel card-hover rounded-3xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125" />
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-100/50 rounded-2xl flex items-center justify-center transform group-hover:-scale-110 transition-transform">
                                <Target className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-800 tabular-nums drop-shadow-sm group-hover:text-emerald-600 transition-colors">{numberFormatter.format(data.stats.accuracy)}<span className="text-lg">%</span></p>
                                <p className="text-sm font-semibold text-slate-500">Độ chính xác</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <ProgressChartWidget
                            title="📊 Tiến độ theo chủ đề"
                            data={data.topic_progress.map((topic) => ({ topic: topic.topic, score: topic.percent }))}
                        />

                        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full" />Trạng thái học tập</h2>
                            <div className="space-y-5">
                                {data.topic_progress.map((topic, index) => (
                                    <div key={index} className="group">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700">{topic.topic}</span>
                                            {getStatusBadge(topic.status)}
                                        </div>
                                        <div className="h-2.5 w-full rounded-full bg-slate-100 shadow-inner overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(topic.status)} group-hover:opacity-80`}
                                                style={{ width: `${topic.percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Teacher Comment */}
                        <div className="glass-panel border border-blue-200/50 bg-blue-50/50 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-6xl opacity-10 drop-shadow-xl transform rotate-12">💬</div>
                            <h2 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                Nhận xét từ cô giáo
                            </h2>
                            <p className="text-slate-700 italic font-medium leading-relaxed bg-white/60 p-4 rounded-2xl shadow-sm">&quot;{data.teacher_comment}&quot;</p>
                            <p className="text-sm font-semibold text-blue-700/80 mt-4 text-right flex items-center justify-end gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">GV</span>
                                {data.teacher_name}, Chủ nhiệm {data.class_name}
                            </p>
                        </div>

                        {/* Class Announcements */}
                        {classId && (
                            <AnnouncementList classId={Number(classId)} isTeacher={false} />
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <HomeworkActionCard
                            title="Ôn tập tuần này"
                            dueDate="2026-03-22"
                            onDownload={() => {
                                window.alert('Tính năng tải PDF sẽ được kết nối API trong bước tiếp theo.');
                            }}
                        />

                        {/* Quick Actions */}
                        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-10" />
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-indigo-500 rounded-full" />Cẩm nang đồng hành</h2>
                            <div className="space-y-4">
                                <Link
                                    to="/parent/solutions/1"
                                    className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 hover:shadow-soft transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                            <FileText className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Hướng dẫn giải bài</p>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">Lời giải chi tiết từng bước</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-emerald-500 transition-colors">
                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                </Link>
                                <Link
                                    to="/parent/student"
                                    className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:bg-blue-50 hover:shadow-soft transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100/80 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-blue-600 drop-shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Màn hình học của con</p>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">Giao diện mà con sẽ thấy</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-blue-500 transition-colors">
                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                </Link>
                                <button className="w-full text-left flex items-center justify-between p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 hover:bg-purple-50 hover:shadow-soft transition-all duration-300 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100/80 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                            <BookMarked className="w-6 h-6 text-purple-600 drop-shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">Bài tập bổ trợ</p>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">AI đề xuất dựa trên lỗi sai</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-purple-500 transition-colors">
                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Today's Assignments */}
                        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-full -z-10" />
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-orange-500 rounded-full" />Bài tập hôm nay</h2>
                            <div className="space-y-4">
                                {data.today_assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className={`p-4 rounded-2xl border bg-white/60 shadow-sm transition-all hover:shadow-soft ${assignment.status === 'completed'
                                            ? 'border-emerald-200'
                                            : 'border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-slate-900">{assignment.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                        {assignment.topic}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500">
                                                        {assignment.correct}/{assignment.total} câu
                                                    </span>
                                                </div>
                                            </div>
                                            {assignment.status === 'completed' ? (
                                                <span className="text-xs font-bold px-3 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full flex items-center gap-1 shadow-sm">
                                                    Hoàn thành <span className="text-emerald-500">✓</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold px-3 py-1.5 bg-blue-100 border border-blue-200 text-blue-700 rounded-full flex items-center gap-1 shadow-sm">
                                                    Đang làm...
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Simple Progress Bar for Assignment */}
                                        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${assignment.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                style={{ width: `${(assignment.correct / assignment.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
