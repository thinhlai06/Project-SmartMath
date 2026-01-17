import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Users, ChevronRight, BookOpen, BarChart3, FileDown, Camera } from 'lucide-react';

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

// Placeholder for Teacher Home
function TeacherHome() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-600">Lớp học</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-600">Học sinh</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-3xl font-bold text-gray-900">0</p>
                        <p className="text-gray-600">Bài tập</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <p className="text-3xl font-bold text-gray-900">-</p>
                        <p className="text-gray-600">Điểm TB</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
                    <p className="text-gray-600 mb-4">Các chức năng sẽ được bổ sung trong Phase 2.</p>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg opacity-50 cursor-not-allowed">
                            Tạo CPA (Coming soon)
                        </button>
                        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg opacity-50 cursor-not-allowed">
                            Phân hóa (Coming soon)
                        </button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg opacity-50 cursor-not-allowed">
                            Xuất PDF (Coming soon)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Placeholder for Parent Home
function ParentHome() {
    const { user, logout } = useAuth();

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

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Bảng điều khiển Phụ huynh</h1>

                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tham gia lớp học</h2>
                    <p className="text-gray-600 mb-4">
                        Nhập mã lớp học từ giáo viên để tham gia và theo dõi tiến độ học tập của con.
                    </p>
                    <p className="text-gray-500 text-sm">Chức năng sẽ được bổ sung trong Phase 5.</p>
                </div>
            </div>
        </div>
    );
}
