import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Zap, Target, QrCode, Lock, CheckCircle, BookOpen } from 'lucide-react';

// Mock student data
const MOCK_STUDENT = {
    name: 'An',
    weeklyCompleted: 12,
    stats: {
        stars: 48,
        streak: 5,
        accuracy: 85
    },
    todayTasks: [
        { id: 1, topic: 'Phép chia có dư', status: 'completed', correct: 5, total: 5, stars: 5 },
        { id: 2, topic: 'Bài toán tổng hợp', status: 'in_progress', correct: 3, total: 8, stars: 0 },
        { id: 3, topic: 'Đổi đơn vị đo', status: 'locked', correct: 0, total: 5, stars: 0 },
    ],
    learningPath: [
        { topic: 'Phép cộng trong phạm vi 1000', status: 'completed', stars: 5 },
        { topic: 'Phép trừ trong phạm vi 1000', status: 'completed', stars: 5 },
        { topic: 'Phép nhân với 2, 3, 4', status: 'completed', stars: 4 },
        { topic: 'Phép chia có dư', status: 'completed', stars: 5 },
        { topic: 'Bài toán có nhiều bước', status: 'active', stars: 0 },
        { topic: 'Đổi đơn vị đo độ dài', status: 'locked', stars: 0 },
        { topic: 'Phân số đơn giản', status: 'locked', stars: 0 },
    ]
};

export default function StudentExperiencePage() {
    const renderStars = (count: number, max: number = 5) => {
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: max }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in_progress':
                return <BookOpen className="w-5 h-5 text-blue-500" />;
            case 'locked':
                return <Lock className="w-5 h-5 text-gray-400" />;
            default:
                return null;
        }
    };

    const getPathStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="text-green-500">✓</span>;
            case 'active':
                return <span className="text-blue-500 font-bold">●</span>;
            case 'locked':
                return <Lock className="w-4 h-4 text-gray-400" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
                    <Link to="/parent" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <span className="text-sm text-gray-500">← Quay lại trang phụ huynh</span>
                </div>
            </nav>

            <div className="max-w-lg mx-auto px-4 py-6">
                {/* Welcome Header */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">👋</div>
                    <h1 className="text-2xl font-bold text-gray-900">Xin chào {MOCK_STUDENT.name}!</h1>
                    <p className="text-gray-600">Hãy cùng học toán vui vẻ nhé</p>
                </div>

                {/* Achievement Banner */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 mb-6 text-white text-center">
                    <h3 className="font-bold text-lg">🏆 Làm tốt lắm!</h3>
                    <p>Tuần này em hoàn thành {MOCK_STUDENT.weeklyCompleted} bài</p>
                    <div className="flex justify-center gap-3 mt-2 text-2xl">
                        ⭐ 🏆 🎯
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{MOCK_STUDENT.stats.stars}</p>
                        <p className="text-xs text-gray-500">ngôi sao</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{MOCK_STUDENT.stats.streak}</p>
                        <p className="text-xs text-gray-500">ngày liên tiếp</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Target className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{MOCK_STUDENT.stats.accuracy}%</p>
                        <p className="text-xs text-gray-500">làm đúng</p>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                    <h2 className="font-bold text-gray-900 mb-4">📅 NHIỆM VỤ HÔM NAY</h2>
                    <div className="space-y-3">
                        {MOCK_STUDENT.todayTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-4 rounded-xl border-2 ${task.status === 'completed'
                                        ? 'bg-green-50 border-green-200'
                                        : task.status === 'in_progress'
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-gray-50 border-gray-200 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getTaskStatusIcon(task.status)}
                                        <div>
                                            <p className="font-medium text-gray-800">{task.topic}</p>
                                            <p className="text-xs text-gray-500">
                                                {task.status === 'locked'
                                                    ? 'Hoàn thành bài trên để mở'
                                                    : `${task.correct}/${task.total} câu`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {task.status === 'completed' && renderStars(task.stars)}
                                    {task.status === 'in_progress' && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {Math.round((task.correct / task.total) * 100)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Scan Entry */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 mb-6 text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold">📱 Bắt đầu học bài mới</h3>
                    <p className="text-sm opacity-90 mb-3">Quét mã QR trên phiếu bài tập hoặc sách</p>
                    <button className="px-6 py-2 bg-white text-purple-600 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                        Mở máy quét QR
                    </button>
                </div>

                {/* Learning Path */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4">🗺️ LỘ TRÌNH HỌC TẬP</h2>
                    <div className="space-y-3">
                        {MOCK_STUDENT.learningPath.map((item, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-3 rounded-xl ${item.status === 'completed'
                                        ? 'bg-green-50'
                                        : item.status === 'active'
                                            ? 'bg-blue-50 border-2 border-blue-300'
                                            : 'bg-gray-50 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        {getPathStatus(item.status)}
                                    </div>
                                    <span className={`text-sm ${item.status === 'locked' ? 'text-gray-400' : 'text-gray-700'
                                        }`}>
                                        {item.topic}
                                    </span>
                                </div>
                                {item.status === 'completed' && renderStars(item.stars)}
                                {item.status === 'active' && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                        Đang học
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
