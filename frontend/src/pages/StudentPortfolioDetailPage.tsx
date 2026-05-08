import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, ClipboardList, ShieldCheck } from 'lucide-react';

import { ProgressStatusBadge } from '@/components/portfolio/ProgressStatusBadge';
import { RecommendationPanel } from '@/components/portfolio/RecommendationPanel';
import { RepeatedMistakesCard } from '@/components/portfolio/RepeatedMistakesCard';
import { ScoreTrendChart } from '@/components/portfolio/ScoreTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentPortfolio } from '@/features/student-portfolio/queries';

export default function StudentPortfolioDetailPage() {
    const params = useParams();
    const classId = params.classId ? Number(params.classId) : null;
    const studentId = params.studentId ? Number(params.studentId) : null;
    const hasInvalidParams =
        classId === null ||
        studentId === null ||
        !Number.isInteger(classId) ||
        !Number.isInteger(studentId) ||
        classId <= 0 ||
        studentId <= 0;
    const portfolioQuery = useStudentPortfolio(hasInvalidParams ? null : classId, hasInvalidParams ? null : studentId);
    const portfolio = portfolioQuery.data;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="container mx-auto max-w-6xl space-y-6">
                <Link to="/student-portfolios" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách portfolio
                </Link>

                {hasInvalidParams && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                        Đường dẫn hồ sơ học sinh không hợp lệ. Vui lòng quay lại danh sách portfolio.
                    </div>
                )}

                {!hasInvalidParams && portfolioQuery.isLoading && <Skeleton className="h-72 w-full rounded-2xl" />}
                {!hasInvalidParams && portfolioQuery.isError && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Không thể tải hồ sơ học sinh.</div>}

                {!hasInvalidParams && portfolio && (
                    <>
                        <Card className="border-indigo-100 bg-white/90">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-600">Hồ sơ học sinh</p>
                                        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{portfolio.student_name}</h1>
                                        <p className="mt-1 text-slate-500">Nhóm: {portfolio.tier || 'Chưa gán'} · Nguồn điểm: {portfolio.score_source}</p>
                                    </div>
                                    <ProgressStatusBadge status={portfolio.progress_status} label={portfolio.progress_status_label} />
                                </div>
                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl bg-indigo-50 p-4">
                                        <p className="text-sm text-indigo-600">Điểm trung bình</p>
                                        <p className="text-3xl font-extrabold text-indigo-700">{portfolio.average_score}/10</p>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-50 p-4">
                                        <p className="text-sm text-emerald-600">Trung bình lớp</p>
                                        <p className="text-3xl font-extrabold text-emerald-700">{portfolio.class_average_score}/10</p>
                                    </div>
                                    <div className="rounded-2xl bg-amber-50 p-4">
                                        <p className="text-sm text-amber-600">Bài / lỗi ghi nhận</p>
                                        <p className="text-3xl font-extrabold text-amber-700">{portfolio.total_worksheets} / {portfolio.total_error_records}</p>
                                    </div>
                                </div>
                                {portfolio.data_quality.includes('no_learning_data') && (
                                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Chưa có đủ dữ liệu tiến bộ. Portfolio sẽ cập nhật sau khi giáo viên lưu điểm hoặc lỗi sai.</div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-indigo-500" />
                                        Xu hướng điểm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScoreTrendChart points={portfolio.score_trend} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                        Gợi ý hỗ trợ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RecommendationPanel recommendations={portfolio.recommendations} />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lỗi lặp lại</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RepeatedMistakesCard mistakes={portfolio.repeated_mistakes} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-indigo-500" />
                                        Bài gần đây
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {portfolio.recent_worksheets.length === 0 && <p className="text-sm text-slate-500">Chưa có bài gần đây.</p>}
                                    {portfolio.recent_worksheets.map((item) => (
                                        <div key={item.worksheet_id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                                            <div>
                                                <p className="font-semibold text-slate-800">{item.worksheet_title}</p>
                                                <p className="text-xs text-slate-500">{item.date ? item.date.slice(0, 10) : 'Chưa rõ ngày'} · {item.score_source}</p>
                                            </div>
                                            <span className="font-bold text-indigo-600">{item.score}/{item.max_score}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
