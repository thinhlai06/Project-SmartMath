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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans py-8">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-fuchsia-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            
            <div className="max-w-lg mx-auto px-4 relative z-10">
                <div className="mb-6 flex items-center gap-3">
                    <Link to="/parent" className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-white hover:text-indigo-600 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang phụ huynh
                    </Link>
                </div>

                {/* Welcome Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 drop-shadow-sm animate-bounce">👋</div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Xin chào {MOCK_STUDENT.name}!</h1>
                    <p className="text-slate-500 font-medium mt-1">Hãy cùng học toán vui vẻ nhé</p>
                </div>

                {/* Achievement Banner */}
                <div className="glass-panel bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 mb-8 text-white text-center shadow-soft transform hover:-translate-y-1 transition-transform">
                    <h3 className="font-extrabold text-xl mb-1 drop-shadow-sm">🏆 Làm tốt lắm!</h3>
                    <p className="font-medium text-white/90">Tuần này em hoàn thành {MOCK_STUDENT.weeklyCompleted} bài</p>
                    <div className="flex justify-center gap-4 mt-4 text-3xl drop-shadow-sm">
                        ⭐ 🏆 🎯
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="glass-panel border-white/50 rounded-2xl p-5 shadow-sm text-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-800">{MOCK_STUDENT.stats.stars}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">ngôi sao</p>
                    </div>
                    <div className="glass-panel border-white/50 rounded-2xl p-5 shadow-sm text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-800">{MOCK_STUDENT.stats.streak}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">ngày liên tiếp</p>
                    </div>
                    <div className="glass-panel border-white/50 rounded-2xl p-5 shadow-sm text-center">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-slate-800">{MOCK_STUDENT.stats.accuracy}%</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">làm đúng</p>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="glass-panel border-white/50 rounded-3xl p-6 shadow-soft mb-8">
                    <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <span className="text-xl drop-shadow-sm">📅</span> NHIỆM VỤ HÔM NAY
                    </h2>
                    <div className="space-y-4">
                        {MOCK_STUDENT.todayTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-5 rounded-2xl transition-all ${task.status === 'completed'
                                        ? 'bg-emerald-50/80 border border-emerald-100'
                                        : task.status === 'in_progress'
                                            ? 'bg-indigo-50/80 border border-indigo-100 shadow-sm'
                                            : 'bg-white/40 border border-slate-100 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white rounded-full p-2 shadow-sm">
                                            {getTaskStatusIcon(task.status)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-base">{task.topic}</p>
                                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                                {task.status === 'locked'
                                                    ? 'Hoàn thành bài trên để mở'
                                                    : `${task.correct}/${task.total} câu`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {task.status === 'completed' && renderStars(task.stars)}
                                    {task.status === 'in_progress' && (
                                        <span className="text-sm font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                                            {Math.round((task.correct / task.total) * 100)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Scan Entry */}
                <div className="glass-panel bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 mb-8 text-white text-center shadow-soft transform hover:-translate-y-1 transition-transform">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-sm">
                        <QrCode className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-xl drop-shadow-sm mb-1">📱 Bắt đầu học bài mới</h3>
                    <p className="text-sm font-medium text-white/80 mb-5">Quét mã QR trên phiếu bài tập hoặc sách</p>
                    <button className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-soft hover:bg-slate-50 transition-all active:scale-95">
                        Mở máy quét QR
                    </button>
                </div>

                {/* Learning Path */}
                <div className="glass-panel border-white/50 rounded-3xl p-6 shadow-soft">
                    <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <span className="text-xl drop-shadow-sm">🗺️</span> LỘ TRÌNH HỌC TẬP
                    </h2>
                    <div className="space-y-4">
                        {MOCK_STUDENT.learningPath.map((item, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${item.status === 'completed'
                                        ? 'bg-emerald-50/80 border border-emerald-100'
                                        : item.status === 'active'
                                            ? 'bg-indigo-50/80 border border-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                                            : 'bg-white/40 border border-slate-100 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        {getPathStatus(item.status)}
                                    </div>
                                    <span className={`font-semibold ${item.status === 'locked' ? 'text-slate-400' : 'text-slate-700'
                                        }`}>
                                        {item.topic}
                                    </span>
                                </div>
                                {item.status === 'completed' && renderStars(item.stars)}
                                {item.status === 'active' && (
                                    <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
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
