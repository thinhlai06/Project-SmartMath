import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { classApi } from '../services/classApi';
import type { MathClass } from '../services/classApi';
import { GraduationCap, BookOpen, BarChart3, FileDown, Camera, Users, ChevronRight } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
            <div className="max-w-6xl mx-auto px-4 py-16">
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
                const token = localStorage.getItem('access_token');

                // Fetch stats from new API
                const statsResponse = await fetch('http://localhost:8000/api/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
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
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Bảng điều khiển Giáo viên</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => navigate('/classes')}
                    >
                        {isLoading ? (
                            <div className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{classCount}</p>
                        )}
                        <p className="text-gray-600">Lớp học</p>
                        <p className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Xem chi tiết →</p>
                    </div>
                    <div
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => navigate('/classes')}
                    >
                        {isLoading ? (
                            <div className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-3xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{studentCount}</p>
                        )}
                        <p className="text-gray-600">Học sinh</p>
                        <p className="text-xs text-teal-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Xem chi tiết →</p>
                    </div>
                    <div
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => classes.length > 0 ? navigate(`/classes/${classes[0].id}/worksheets`) : null}
                    >
                        {isLoading ? (
                            <div className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{worksheetCount}</p>
                        )}
                        <p className="text-gray-600">Bài tập</p>
                        <p className="text-xs text-orange-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Xem chi tiết →</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm opacity-60">
                        <p className="text-3xl font-bold text-gray-900">-</p>
                        <p className="text-gray-600">Điểm TB</p>
                        <p className="text-xs text-gray-400 mt-2">Coming soon</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Error Analysis (Left 2 cols) */}
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">📊 Phân tích lỗi phổ biến</h2>
                            <button onClick={() => navigate('/error-analytics')} className="text-sm text-blue-600 hover:underline">Chi tiết</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-gray-500 text-sm">Tổng số lỗi tuần này</p>
                                <p className="text-2xl font-bold text-red-600">{mockErrorStats.totalErrors.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-gray-500 text-sm">Lỗi phổ biến nhất</p>
                                <p className="text-2xl font-bold text-orange-600">{mockErrorStats.mostCommonType}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex gap-3">
                                <div className="p-2 bg-white rounded-full h-fit shadow-sm">💡</div>
                                <div>
                                    <p className="font-semibold text-blue-900">Gợi ý giảng dạy</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Có {mockErrorStats.criticalStudents} học sinh đang gặp khó khăn nghiêm trọng.
                                        Hãy xem chi tiết đề xuất bài tập bổ trợ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities (Right 1 col) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
                        <div className="flex-1">
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
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/parent/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
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
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/parent/join-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
        } catch (err) {
            setJoinError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
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

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">👨‍👩‍👧 Quản lý con</h1>
                    <div>
                        <button
                            onClick={() => navigate('/ai-grading')}
                            className="mr-3 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            Chấm điểm AI
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Thêm con vào lớp
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : children.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa có con nào</h2>
                        <p className="text-gray-600 mb-6">
                            Nhập mã lớp từ giáo viên để thêm con và theo dõi tiến độ học tập.
                        </p>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                        >
                            Thêm con vào lớp
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {children.map((child) => (
                            <div
                                key={child.id}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => navigate(`/parent/class/${child.class_id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                            {child.student_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{child.student_name}</h3>
                                            <p className="text-gray-600">{child.class_name} • Lớp {child.grade}</p>
                                            <p className="text-sm text-gray-500">GV: {child.teacher_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="hidden md:block text-sm text-gray-500">
                                            Xem tiến độ
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
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

