import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { classApi } from '../services/classApi';
import type { MathClass } from '../services/classApi';
import { GraduationCap, BookOpen, BarChart3, FileDown, Camera, Users, ChevronRight, Settings } from 'lucide-react';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { mockErrorStats } from '../mockData/mockErrorData';

export function HomePage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If authenticated, show role-based content
    if (isAuthenticated && user) {
        if (user.role === 'teacher') {
            return <TeacherHome />;
        } else {
            return <ParentHome />;
        }
    }

    // Landing page for non-authenticated users
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
            
            <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <span className="text-4xl">📐</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Smart-MathAI
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Hệ thống gia sư toán AI cho học sinh tiểu học Việt Nam
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                            Đăng ký
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Dành cho Giáo viên</h2>
                                <p className="text-gray-600">Tiết kiệm 80% thời gian soạn bài</p>
                            </div>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Tạo học liệu theo phương pháp CPA
                            </li>
                            <li className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                Phân hóa 4 cấp độ tự động
                            </li>
                            <li className="flex items-center gap-2">
                                <FileDown className="w-5 h-5 text-blue-500" />
                                Xuất PDF với mã QR thông minh
                            </li>
                            <li className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-blue-500" />
                                Chấm bài bằng AI (Coming soon)
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Dành cho Phụ huynh</h2>
                                <p className="text-gray-600">Đồng hành cùng con học toán</p>
                            </div>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Hướng dẫn giải bài theo phương pháp mới
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Theo dõi tiến độ học tập của con
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Nhận bài tập bổ trợ phù hợp
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Kết nối với giáo viên
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-500">80%</p>
                        <p className="text-sm text-gray-600">Tiết kiệm thời gian</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-teal-500">CPA</p>
                        <p className="text-sm text-gray-600">Phương pháp Singapore</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">1-3</p>
                        <p className="text-sm text-gray-600">Lớp tiểu học</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Teacher Home with real data binding
function TeacherHome() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [stats, setStats] = useState<{
        total_classes: number;
        total_students: number;
        total_worksheets: number;
        avg_score: number | null;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch dashboard stats and classes on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats from new API
                const statsResponse = await fetch('/api/dashboard/stats', {
                    credentials: 'include',
                });
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Still need classes for navigation
                const classesData = await classApi.getClasses();
                setClasses(classesData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get stats values
    const classCount = stats?.total_classes ?? 0;
    const studentCount = stats?.total_students ?? 0;
    const worksheetCount = stats?.total_worksheets ?? 0;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            
            <nav className="glass-panel sticky top-4 mx-4 md:mx-auto max-w-7xl rounded-2xl z-50 px-2 py-1 mb-8">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-soft transform -rotate-2">
                            <span className="text-xl drop-shadow-sm">📐</span>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-800">Smart-MathAI</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/50 px-4 py-2 rounded-xl border border-slate-100/50 shadow-sm">
                        <button
                            type="button"
                            onClick={() => navigate('/settings')}
                            className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold hover:bg-indigo-200 transition-colors"
                            title="Cài đặt hồ sơ"
                        >
                            {user?.full_name?.charAt(0) || 'GV'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/settings')}
                            className="text-slate-700 font-medium font-sans hover:text-indigo-600 transition-colors"
                        >
                            Cô {user?.full_name}
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button
                            type="button"
                            onClick={() => navigate('/settings')}
                            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <Settings className="w-4 h-4 mr-1" />
                            Cài đặt
                        </button>
                        <button
                            onClick={logout}
                            className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 pb-12 relative z-10">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">Bảng điều khiển Giáo viên</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div
                        className="glass-panel card-hover rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
                        onClick={() => navigate('/classes')}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 transition-transform group-hover:scale-150" />
                        {isLoading ? (
                            <div className="h-9 w-12 bg-slate-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-4xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors drop-shadow-sm">{classCount}</p>
                        )}
                        <p className="text-slate-600 font-medium mt-1 relative z-10">Lớp học</p>
                        <p className="text-sm font-semibold text-indigo-500 mt-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">Xem chi tiết &rarr;</p>
                    </div>
                    <div
                        className="glass-panel card-hover rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
                        onClick={() => navigate('/classes')}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-100 rounded-full opacity-50 transition-transform group-hover:scale-150" />
                        {isLoading ? (
                            <div className="h-9 w-12 bg-slate-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-4xl font-black text-slate-800 group-hover:text-teal-600 transition-colors drop-shadow-sm">{studentCount}</p>
                        )}
                        <p className="text-slate-600 font-medium mt-1 relative z-10">Học sinh</p>
                        <p className="text-sm font-semibold text-teal-500 mt-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">Xem chi tiết &rarr;</p>
                    </div>
                    <div
                        className="glass-panel card-hover rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
                        onClick={() => classes.length > 0 ? navigate(`/classes/${classes[0].id}/worksheets`) : null}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100 rounded-full opacity-50 transition-transform group-hover:scale-150" />
                        {isLoading ? (
                            <div className="h-9 w-12 bg-slate-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-4xl font-black text-slate-800 group-hover:text-orange-600 transition-colors drop-shadow-sm">{worksheetCount}</p>
                        )}
                        <p className="text-slate-600 font-medium mt-1 relative z-10">Bài tập</p>
                        <p className="text-sm font-semibold text-orange-500 mt-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">Xem chi tiết &rarr;</p>
                    </div>
                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden opacity-70">
                        <p className="text-4xl font-black text-slate-800 drop-shadow-sm">-</p>
                        <p className="text-slate-600 font-medium mt-1">Điểm TB</p>
                        <p className="text-sm font-semibold text-slate-400 mt-4 bg-slate-100 w-fit px-2 py-0.5 rounded-md">Coming soon</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel rounded-3xl p-8 mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-indigo-500 rounded-full" />Thao tác nhanh</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                        <QuickActionCard
                            title="Tạo CPA"
                            icon="📖"
                            color="blue"
                            onClick={() => navigate('/cpa-wizard')}
                        />
                        <QuickActionCard
                            title="Phân hóa"
                            icon="🎯"
                            color="purple"
                            onClick={() => navigate('/differentiation-wizard')}
                        />
                        <QuickActionCard
                            title="Xuất PDF"
                            icon="📥"
                            color="orange"
                            onClick={() => classes.length > 0 ? navigate(`/classes/${classes[0].id}/worksheets`) : navigate('/classes')}
                        />
                        <QuickActionCard
                            title="Chấm bài AI"
                            icon="📷"
                            color="teal"
                            badge="Beta"
                            onClick={() => navigate('/ai-grading')}
                        />
                        <QuickActionCard
                            title="Phân tích lỗi"
                            icon="📊"
                            color="red"
                            onClick={() => navigate('/error-analytics')}
                        />
                    </div>
                </div>

                {/* Two Column Layout: Error Analysis & Recent Activities */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Error Analysis (Left 2 cols) */}
                    <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-6 bg-rose-400 rounded-full" />Phân tích lỗi</h2>
                            <button onClick={() => navigate('/error-analytics')} className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl">Xem chi tiết</button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100/50 shadow-sm">
                                <p className="text-slate-500 font-medium mb-1">Tổng số lỗi tuần này</p>
                                <p className="text-3xl font-black text-rose-600 drop-shadow-sm">{mockErrorStats.totalErrors.toLocaleString()}</p>
                            </div>
                            <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100/50 shadow-sm">
                                <p className="text-slate-500 font-medium mb-1">Lỗi xuất hiện nhiều nhất</p>
                                <p className="text-xl font-bold text-orange-600 mt-2">{mockErrorStats.mostCommonType}</p>
                            </div>
                        </div>

                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 shadow-sm">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-xl transform -rotate-6">💡</div>
                                <div>
                                    <p className="font-bold text-indigo-900 mb-1">Gợi ý sư phạm AI</p>
                                    <p className="text-sm text-indigo-700/80 leading-relaxed font-medium">
                                        Phát hiện <span className="font-bold text-rose-600">{mockErrorStats.criticalStudents}</span> học sinh đang gặp khó khăn với các khái niệm cốt lõi. Hệ thống đề xuất tạo Worksheet phụ đạo chuyên đề môn Phân số tập trung vào biểu diễn hình học.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities (Right 1 col) */}
                    <div className="glass-panel rounded-3xl p-8 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-emerald-400 rounded-full" />Hoạt động gần đây</h2>
                        <div className="flex-1 overflow-auto pr-2">
                            <RecentActivityList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Parent Home with real functionality
function ParentHome() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [children, setChildren] = useState<Array<{
        id: number;
        class_id: number;
        class_name: string;
        grade: number;
        student_name: string;
        teacher_name: string;
        joined_at: string;
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinForm, setJoinForm] = useState({ class_code: '', student_name: '' });
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);

    // Fetch parent's children/classes
    const fetchChildren = async () => {
        try {
            const response = await fetch('/api/parent/classes', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setChildren(data);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError(null);
        setJoinSuccess(null);

        if (!joinForm.class_code.trim() || !joinForm.student_name.trim()) {
            setJoinError('Vui lòng nhập đầy đủ mã lớp và tên con');
            return;
        }

        setIsJoining(true);

        try {
            const response = await fetch('/api/parent/join-class', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    class_code: joinForm.class_code.toUpperCase(),
                    student_name: joinForm.student_name
                })
            });

            const data = await response.json();

            if (response.ok) {
                setJoinSuccess(`Đã thêm ${joinForm.student_name} vào lớp ${data.class_name}!`);
                setJoinForm({ class_code: '', student_name: '' });
                fetchChildren(); // Refresh list
                setTimeout(() => {
                    setShowJoinModal(false);
                    setJoinSuccess(null);
                }, 1500);
            } else {
                setJoinError(data.detail || 'Không thể tham gia lớp');
            }
        } catch (_err) {
            setJoinError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-0 w-[60%] h-[40%] bg-orange-200/30 rounded-full blur-[100px] -z-0 pointer-events-none" />

            <nav className="glass-panel sticky top-4 mx-4 md:mx-auto max-w-7xl rounded-2xl z-50 px-2 py-1 mb-8">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-soft transform rotate-2">
                            <span className="text-xl drop-shadow-sm">👨‍👩‍👦</span>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-800">Smart-MathAI</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/50 px-4 py-2 rounded-xl border border-slate-100/50 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {user?.full_name?.charAt(0) || 'PH'}
                        </div>
                        <span className="text-slate-700 font-medium font-sans">{user?.full_name}</span>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button
                            onClick={logout}
                            className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 pb-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        Quản lý học tập
                    </h1>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate('/ai-grading')}
                            className="btn-bounce px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 hover:bg-white text-slate-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow-soft inline-flex items-center gap-2"
                        >
                            <Camera className="w-5 h-5 text-emerald-500" />
                            Chấm điểm tự động
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="btn-bounce px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-soft hover:shadow-soft-lg inline-flex items-center gap-2"
                        >
                            <Users className="w-5 h-5" />
                            Thêm con vào lớp
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full drop-shadow-sm"></div>
                    </div>
                ) : children.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-16 text-center shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent -z-10" />
                        <div className="w-24 h-24 bg-emerald-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                            <Users className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">Chưa thêm học sinh</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium leading-relaxed">
                            Vui lòng xin Mã lớp học từ cô giáo chủ nhiệm để kết nối và đồng hành cùng tiến trình học tập của con bạn.
                        </p>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="btn-bounce px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-soft hover:shadow-soft-lg"
                        >
                            Bắt đầu kết nối
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-6">
                        {children.map((child) => (
                            <div
                                key={child.id}
                                className="glass-panel card-hover rounded-3xl p-6 cursor-pointer group flex flex-col justify-between min-h-[160px] relative overflow-hidden shadow-sm hover:shadow-soft"
                                onClick={() => navigate(`/parent/class/${child.class_id}`)}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150" />
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-soft transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                        {child.student_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-slate-800 truncate mb-1 group-hover:text-emerald-700 transition-colors">{child.student_name}</h3>
                                        <div className="flex flex-wrap gap-2 text-sm text-slate-500 items-center">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-600 truncate max-w-full block">Lớp {child.class_name}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium mt-2 bg-white/50 w-fit px-2 py-1 rounded-lg border border-slate-100">Cố vấn: <span className="text-slate-600">{child.teacher_name}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100/50">
                                    <span className="text-sm font-semibold text-emerald-600/80 group-hover:text-emerald-600 transition-colors">
                                        Phân tích kết quả
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        <ChevronRight className="w-5 h-5 text-emerald-500 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Join Class Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Thêm con vào lớp</h2>
                                    <p className="text-sm text-gray-500">Nhập mã lớp từ giáo viên</p>
                                </div>
                            </div>
                            <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleJoinClass} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã lớp học</label>
                                <input
                                    type="text"
                                    placeholder="Nhập mã lớp (VD: ABC123)"
                                    value={joinForm.class_code}
                                    onChange={(e) => setJoinForm({ ...joinForm, class_code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên con</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên con (VD: Nguyễn Văn An)"
                                    value={joinForm.student_name}
                                    onChange={(e) => setJoinForm({ ...joinForm, student_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {joinError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{joinError}</p>
                                </div>
                            )}

                            {joinSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-600">{joinSuccess}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isJoining}
                                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    {isJoining ? 'Đang xử lý...' : 'Thêm con'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

