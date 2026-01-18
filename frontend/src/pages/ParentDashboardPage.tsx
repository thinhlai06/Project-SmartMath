import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    BookOpen, Clock, Star, Target,
    FileText, Users, BookMarked,
    ChevronRight, MessageSquare
} from 'lucide-react';
import { AnnouncementList } from '../components/AnnouncementList';

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
    const { user, logout } = useAuth();
    const { classId } = useParams<{ classId: string }>();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(
                    `http://localhost:8000/api/parent/dashboard/${classId}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📐</span>
                        </div>
                        <span className="font-bold text-gray-900">Smart-MathAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Xin chào, {user?.full_name}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        👋 Xin chào, Phụ huynh {data.student_name}
                    </h1>
                    <p className="text-gray-600">Cẩm nang đồng hành cùng con học toán</p>
                </div>

                {/* Premium Banner */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 mb-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                🏆 Gói Premium - Đồng hành tối ưu
                            </h3>
                            <p className="text-sm opacity-90">
                                • Giải thích đơn giản • Theo dõi tiến độ chi tiết
                            </p>
                        </div>
                        <span className="text-sm opacity-80">Đến 30/06/2026</span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data.stats.completed}</p>
                                <p className="text-xs text-gray-500">bài xong</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data.stats.study_time}p</p>
                                <p className="text-xs text-gray-500">hôm nay</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data.stats.avg_score}</p>
                                <p className="text-xs text-gray-500">điểm TB</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data.stats.accuracy}%</p>
                                <p className="text-xs text-gray-500">làm đúng</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Topic Progress */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 mb-4">📊 Tiến độ theo chủ đề</h2>
                            <div className="space-y-4">
                                {data.topic_progress.map((topic, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                                            {getStatusBadge(topic.status)}
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getProgressColor(topic.status)}`}
                                                style={{ width: `${topic.percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Teacher Comment */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                💙 Nhận xét từ giáo viên
                            </h2>
                            <p className="text-gray-700 italic">&quot;{data.teacher_comment}&quot;</p>
                            <p className="text-sm text-gray-500 mt-2">- {data.teacher_name}, GV {data.class_name}</p>
                        </div>

                        {/* Class Announcements */}
                        {classId && (
                            <AnnouncementList classId={Number(classId)} isTeacher={false} />
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 mb-4">📚 Cẩm nang đồng hành</h2>
                            <div className="space-y-3">
                                <Link
                                    to="/parent/solutions/1"
                                    className="flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-gray-700">Hướng dẫn giải bài</p>
                                            <p className="text-xs text-gray-500">Giải thích đơn giản</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                </Link>
                                <Link
                                    to="/parent/student"
                                    className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-700">Màn hình học của con</p>
                                            <p className="text-xs text-gray-500">Xem tiến độ và bài tập</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                </Link>
                                <button className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <BookMarked className="w-5 h-5 text-purple-600" />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-700">Bài tập bổ trợ</p>
                                            <p className="text-xs text-gray-500">Luyện thêm tại nhà</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                                </button>
                            </div>
                        </div>

                        {/* Today's Assignments */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 mb-4">📝 Bài tập hôm nay</h2>
                            <div className="space-y-3">
                                {data.today_assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className={`p-3 rounded-xl border ${assignment.status === 'completed'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-700">{assignment.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {assignment.correct}/{assignment.total} câu
                                                </p>
                                            </div>
                                            {assignment.status === 'completed' ? (
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                    Hoàn thành ✓
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    Đang làm
                                                </span>
                                            )}
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
