import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, FolderOpen, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ProgressStatusBadge } from '@/components/portfolio/ProgressStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useClassStudentPortfolios } from '@/features/student-portfolio/queries';
import { classApi } from '@/services/classApi';
import type { MathClass } from '@/services/classApi';
import { useQuery } from '@tanstack/react-query';

export default function StudentPortfolioHubPage() {
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const classesQuery = useQuery({
        queryKey: ['classes', 'portfolio-selector'],
        queryFn: () => classApi.getClasses(0, 100),
    });

    const classes = useMemo(() => classesQuery.data || [], [classesQuery.data]);
    const activeClassId = selectedClassId ?? classes[0]?.id ?? null;
    const portfoliosQuery = useClassStudentPortfolios(activeClassId);

    const selectedClass = useMemo<MathClass | undefined>(() => classes.find((item) => item.id === activeClassId), [classes, activeClassId]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="container mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                            <FolderOpen className="h-4 w-4" />
                            Hồ sơ tiến bộ
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Smart Student Progress Portfolio</h1>
                        <p className="mt-1 text-slate-500">Theo dõi tiến bộ, lỗi lặp lại và gợi ý hỗ trợ cho từng học sinh.</p>
                    </div>
                    <div className="w-full md:w-72">
                        <Select value={activeClassId ? String(activeClassId) : ''} onValueChange={(value) => setSelectedClassId(Number(value))}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Chọn lớp học" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.class_name} - Lớp {item.grade}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {classesQuery.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}

                {classesQuery.isError && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-red-600">
                            <Users className="h-10 w-10 text-red-300" />
                            Không thể tải danh sách lớp học. Vui lòng thử lại sau.
                        </CardContent>
                    </Card>
                )}

                {!classesQuery.isLoading && !classesQuery.isError && !classes.length && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-slate-500">
                            <Users className="h-10 w-10 text-slate-300" />
                            Chưa có lớp học để xem hồ sơ tiến bộ.
                        </CardContent>
                    </Card>
                )}

                {selectedClass && (
                    <Card className="border-indigo-100 bg-white/90">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <BookOpen className="h-5 w-5 text-indigo-500" />
                                {selectedClass.class_name} - Lớp {selectedClass.grade}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {portfoliosQuery.isLoading && <Skeleton className="h-48 w-full rounded-2xl" />}
                            {portfoliosQuery.isError && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">Không thể tải hồ sơ tiến bộ.</div>}
                            {portfoliosQuery.data && portfoliosQuery.data.students.length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">Chưa có học sinh trong lớp này.</div>
                            )}
                            {portfoliosQuery.data && portfoliosQuery.data.students.length > 0 && (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {portfoliosQuery.data.students.map((student) => (
                                        <Link
                                            key={student.student_id}
                                            to={`/classes/${activeClassId}/students/${student.student_id}/portfolio`}
                                            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{student.student_name}</h3>
                                                    <p className="text-xs text-slate-500">Nhóm: {student.tier || 'Chưa gán'}</p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-300" />
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500">Điểm TB</p>
                                                    <p className="text-2xl font-extrabold text-indigo-600">{student.average_score}/10</p>
                                                </div>
                                                <ProgressStatusBadge status={student.progress_status} label={student.progress_status_label} />
                                            </div>
                                            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                                                {student.top_repeated_mistake
                                                    ? `Lỗi nổi bật: ${student.top_repeated_mistake.error_type} (${student.top_repeated_mistake.count} lần)`
                                                    : 'Chưa có lỗi lặp lại nổi bật.'}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
