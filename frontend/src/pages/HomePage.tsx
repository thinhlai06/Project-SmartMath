import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { classApi } from '../services/classApi';
import type { MathClass } from '../services/classApi';
import { GraduationCap, BookOpen, BarChart3, FileDown, Camera, Settings } from 'lucide-react';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import aiApi from '../services/aiApi';

export function HomePage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If authenticated, show teacher content
    if (isAuthenticated && user) {
        return <TeacherHome />;
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
                            <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-7 h-7 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Phân tích & Báo cáo AI</h2>
                                <p className="text-gray-600">Hiểu sâu tiến trình từng học sinh</p>
                            </div>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-violet-500" />
                                Chấm bài tự động từ ảnh chụp
                            </li>
                            <li className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-violet-500" />
                                Thống kê lỗi sai theo từng dạng bài
                            </li>
                            <li className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-violet-500" />
                                Gợi ý bài tập bổ trợ phù hợp năng lực
                            </li>
                            <li className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-violet-500" />
                                Quản lý sổ điểm kỹ thuật số
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
    const [analyticsSummary, setAnalyticsSummary] = useState({
        totalErrors: 0,
        dominantErrorType: '',
        dominantErrorLabel: 'Chưa có dữ liệu',
        topErrorStudent: 'Chưa có dữ liệu',
        topErrorCount: 0,
    });

    const formatMistakeLabel = (mistakeType: string): string => {
        return mistakeType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const buildPedagogicalSuggestion = (errorType: string, topStudent: string, topCount: number): string => {
        const studentHint = topCount > 0
            ? `Ưu tiên hỗ trợ ${topStudent} với ${topCount} lỗi đã ghi nhận.`
            : 'Tiếp tục theo dõi dữ liệu lỗi mới để cá nhân hóa phụ đạo.';

        switch (errorType) {
            case 'tinh_sai':
                return `${studentHint} Tổ chức 5-7 phút luyện tính nhẩm đầu giờ với bộ bài ngắn.`;
            case 'nham_phep_tinh':
                return `${studentHint} Ôn lại dấu phép tính bằng bài tập phân loại cộng, trừ, nhân, chia theo tình huống.`;
            case 'thieu_don_vi':
                return `${studentHint} Yêu cầu học sinh luôn kiểm tra đơn vị ở bước cuối trước khi nộp bài.`;
            case 'doc_de_sai':
                return `${studentHint} Áp dụng quy trình gạch chân dữ kiện và từ khóa trước khi giải toán có lời văn.`;
            case 'sai_loi_giai':
                return `${studentHint} Cho học sinh trình bày lại từng bước giải bằng mẫu câu cố định.`;
            case 'bo_sot_cau':
                return `${studentHint} Hướng dẫn kiểm tra đáp án theo checklist số câu trước khi nộp.`;
            default:
                return `${studentHint} Chia nhóm học sinh theo kiểu lỗi để giao phiếu luyện tập mục tiêu.`;
        }
    };

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

                if (classesData.length > 0) {
                    const analyticsResults = await Promise.all(
                        classesData.map(async (mathClass) => {
                            try {
                                const [summary, errors] = await Promise.all([
                                    aiApi.getAnalytics(mathClass.id),
                                    aiApi.getStudentErrors(mathClass.id),
                                ]);
                                return { summary, errors };
                            } catch (analyticsError) {
                                console.error(`Error fetching analytics for class ${mathClass.id}:`, analyticsError);
                                return null;
                            }
                        })
                    );

                    const mistakeCounter: Record<string, number> = {};
                    const studentErrorCounter: Record<string, number> = {};
                    let totalErrors = 0;

                    analyticsResults.forEach((analyticsData) => {
                        if (!analyticsData) {
                            return;
                        }

                        const commonMistakes = Array.isArray(analyticsData.summary.common_mistakes)
                            ? analyticsData.summary.common_mistakes
                            : [];
                        const studentErrors = Array.isArray(analyticsData.errors.errors)
                            ? analyticsData.errors.errors
                            : [];

                        commonMistakes.forEach((item) => {
                            totalErrors += item.count;
                            mistakeCounter[item.type] = (mistakeCounter[item.type] || 0) + item.count;
                        });

                        studentErrors.forEach((item) => {
                            const studentName = item.student_name || 'Chưa rõ học sinh';
                            studentErrorCounter[studentName] = (studentErrorCounter[studentName] || 0) + 1;
                        });
                    });

                    const sortedMistakes = Object.entries(mistakeCounter).sort((a, b) => b[1] - a[1]);
                    const dominantErrorType = sortedMistakes.length > 0
                        ? sortedMistakes[0][0]
                        : '';
                    const dominantErrorLabel = sortedMistakes.length > 0
                        ? formatMistakeLabel(sortedMistakes[0][0])
                        : 'Chưa có dữ liệu';

                    const sortedStudents = Object.entries(studentErrorCounter).sort((a, b) => b[1] - a[1]);
                    const topErrorStudent = sortedStudents.length > 0 ? sortedStudents[0][0] : 'Chưa có dữ liệu';
                    const topErrorCount = sortedStudents.length > 0 ? sortedStudents[0][1] : 0;

                    setAnalyticsSummary({
                        totalErrors,
                        dominantErrorType,
                        dominantErrorLabel,
                        topErrorStudent,
                        topErrorCount,
                    });
                } else {
                    setAnalyticsSummary({
                        totalErrors: 0,
                        dominantErrorType: '',
                        dominantErrorLabel: 'Chưa có dữ liệu',
                        topErrorStudent: 'Chưa có dữ liệu',
                        topErrorCount: 0,
                    });
                }
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
    const avgScore = stats?.avg_score;
    const hasAvgScore = avgScore !== undefined && avgScore !== null;
    const formattedAvgScore = hasAvgScore ? avgScore.toFixed(1) : '-';
    const avgScoreColor = hasAvgScore
        ? avgScore > 8
            ? 'text-emerald-500'
            : avgScore < 6
                ? 'text-orange-500'
                : 'text-indigo-500'
        : 'text-slate-500';

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
                        onClick={() => navigate('/classes')}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100 rounded-full opacity-50 transition-transform group-hover:scale-150" />
                        {isLoading ? (
                            <div className="h-9 w-12 bg-slate-200 rounded animate-pulse"></div>
                        ) : (
                            <p className="text-4xl font-black text-slate-800 group-hover:text-orange-600 transition-colors drop-shadow-sm">{worksheetCount}</p>
                        )}
                        <p className="text-slate-600 font-medium mt-1 relative z-10">Bài tập (tổng)</p>
                        <p className="text-sm font-semibold text-orange-500 mt-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">Xem theo lớp &rarr;</p>
                    </div>
                    <div
                        className="glass-panel card-hover rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
                        onClick={() => navigate('/gradebook')}
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 transition-transform group-hover:scale-150" />
                        {isLoading ? (
                            <div className="h-9 w-12 bg-slate-200 rounded animate-pulse"></div>
                        ) : (
                            <p className={`text-4xl font-black drop-shadow-sm ${avgScoreColor}`}>{formattedAvgScore}</p>
                        )}
                        <p className="text-slate-600 font-medium mt-1 relative z-10">Điểm TB</p>
                        <p className="text-sm font-semibold text-emerald-500 mt-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">Xem sổ điểm &rarr;</p>
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
                                <p className="text-slate-500 font-medium mb-1">Tổng số lỗi đã ghi nhận</p>
                                {isLoading ? (
                                    <div className="h-9 w-20 bg-rose-100 rounded animate-pulse"></div>
                                ) : (
                                    <p className="text-3xl font-black text-rose-600 drop-shadow-sm">{analyticsSummary.totalErrors.toLocaleString()}</p>
                                )}
                            </div>
                            <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100/50 shadow-sm">
                                <p className="text-slate-500 font-medium mb-1">Học sinh có lỗi nhiều nhất</p>
                                {isLoading ? (
                                    <div className="h-7 w-40 bg-orange-100 rounded animate-pulse mt-2"></div>
                                ) : (
                                    <div>
                                        <p className="text-xl font-bold text-orange-600 mt-2">{analyticsSummary.topErrorStudent}</p>
                                        {analyticsSummary.topErrorCount > 0 && (
                                            <p className="text-sm text-orange-500 font-semibold mt-1">{analyticsSummary.topErrorCount} lỗi</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 rounded-xl bg-white/70 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                            <span className="font-semibold">Loại lỗi nổi trội:</span> {analyticsSummary.dominantErrorLabel}
                        </div>

                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 shadow-sm">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-xl transform -rotate-6">💡</div>
                                <div>
                                    <p className="font-bold text-indigo-900 mb-1">Gợi ý sư phạm AI</p>
                                    <p className="text-sm text-indigo-700/80 leading-relaxed font-medium">
                                        {buildPedagogicalSuggestion(
                                            analyticsSummary.dominantErrorType,
                                            analyticsSummary.topErrorStudent,
                                            analyticsSummary.topErrorCount
                                        )}
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

