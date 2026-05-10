import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, FilePlus2, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { classApi } from '@/services/classApi';
import interventionApi, { type InterventionGroup, type InterventionPlan } from '@/services/interventionApi';
import type { InterventionWorksheetPrefillState } from '@/types/interventionPrefill';

function getCurrentIsoWeekYear(): { week: number; year: number } {
    const now = new Date();
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { week, year: date.getUTCFullYear() };
}

function getIsoWeekNumber(date: Date): number {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getIsoWeeksInYear(year: number): number {
    return getIsoWeekNumber(new Date(Date.UTC(year, 11, 28)));
}

function getIsoWeekRangeLabel(week: number, year: number): string {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

    const start = new Date(week1Monday);
    start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    const format = (value: Date) => `${String(value.getUTCDate()).padStart(2, '0')}/${String(value.getUTCMonth() + 1).padStart(2, '0')}`;
    return `${format(start)} - ${format(end)}/${end.getUTCFullYear()}`;
}

function statusBadge(status: InterventionPlan['status']) {
    switch (status) {
        case 'approved':
            return <Badge className="bg-emerald-100 text-emerald-700">Đã duyệt</Badge>;
        case 'completed':
            return <Badge className="bg-indigo-100 text-indigo-700">Hoàn thành</Badge>;
        default:
            return <Badge className="bg-amber-100 text-amber-700">Bản nháp</Badge>;
    }
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === 'string') {
            return detail;
        }
        if (Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === 'string') {
            return detail[0].msg;
        }
        return fallback;
    }

    return error instanceof Error ? error.message : fallback;
}

function GroupCard({
    group,
    onCreateWorksheet,
    creatingWorksheet,
}: {
    group: InterventionGroup;
    onCreateWorksheet: (group: InterventionGroup) => void;
    creatingWorksheet: boolean;
}) {
    return (
        <Card className="rounded-2xl border-slate-200 bg-white/90">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3 text-lg">
                    <span>{group.group_name}</span>
                    <Badge variant="outline">{group.student_ids.length} HS</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
                <div>
                    <p className="font-semibold text-slate-900">Học sinh</p>
                    <p>{group.student_names.join(', ') || 'Chưa có học sinh trong nhóm'}</p>
                </div>

                <div>
                    <p className="font-semibold text-slate-900">Hoạt động đề xuất</p>
                    <p>{group.suggested_activity}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <p className="font-semibold text-slate-900">Bài tập gợi ý</p>
                        <p>
                            {Object.entries(group.suggested_exercises)
                                .map(([tier, count]) => `${count} ${tier}`)
                                .join(' + ') || 'Chưa có'}
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">Thời lượng</p>
                        <p>{group.duration_minutes} phút</p>
                    </div>
                </div>

                <div>
                    <p className="font-semibold text-slate-900">Bằng chứng lỗi gần nhất</p>
                    {group.evidence.length === 0 ? (
                        <p className="text-slate-500">Chưa có bằng chứng chi tiết trong tuần này.</p>
                    ) : (
                        <ul className="space-y-2">
                            {group.evidence.slice(0, 3).map((item, index) => (
                                <li key={`${group.id}-evidence-${index}`} className="rounded-lg bg-slate-50 p-2 text-xs">
                                    <p>{item.question_text || 'Không có nội dung câu hỏi'}</p>
                                    <p>
                                        HS: {item.student_answer || '(trống)'} · Đúng: {item.correct_answer || '(không rõ)'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="space-y-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-9"
                        disabled={creatingWorksheet}
                        onClick={() => onCreateWorksheet(group)}
                    >
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        Tạo worksheet
                    </Button>

                    {group.worksheet_id ? (
                        <p className="text-xs font-semibold text-emerald-700">Đã gắn worksheet ID: {group.worksheet_id}</p>
                    ) : (
                        <p className="text-xs text-slate-500">Chưa có worksheet luyện tập cho nhóm này.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function InterventionPlannerPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [{ week, year }, setWeekState] = useState(getCurrentIsoWeekYear());
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [activePlanId, setActivePlanId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const classesQuery = useQuery({
        queryKey: ['classes', 'intervention-selector'],
        queryFn: () => classApi.getClasses(0, 100),
    });

    useEffect(() => {
        if (!classesQuery.data || classesQuery.data.length === 0 || selectedClassId !== null) {
            return;
        }
        setSelectedClassId(classesQuery.data[0].id);
    }, [classesQuery.data, selectedClassId]);

    const plansQuery = useQuery({
        queryKey: ['intervention-plans', selectedClassId],
        queryFn: () => interventionApi.getPlansForClass(selectedClassId as number),
        enabled: selectedClassId !== null,
    });

    useEffect(() => {
        if (!plansQuery.data || plansQuery.data.length === 0) {
            setActivePlanId(null);
            return;
        }

        const currentWeekPlan = plansQuery.data.find((item) => item.week_number === week && item.year === year);
        setActivePlanId(currentWeekPlan?.id ?? null);
    }, [plansQuery.data, week, year]);

    const planQuery = useQuery({
        queryKey: ['intervention-plan', activePlanId],
        queryFn: () => interventionApi.getPlan(activePlanId as number),
        enabled: activePlanId !== null,
    });

    const generateMutation = useMutation({
        mutationFn: () => interventionApi.generatePlan(selectedClassId as number, week, year),
        onSuccess: (plan) => {
            setErrorMessage(null);
            setActivePlanId(plan.id);
            queryClient.invalidateQueries({ queryKey: ['intervention-plans', selectedClassId] });
            queryClient.invalidateQueries({ queryKey: ['intervention-plan', plan.id] });
        },
        onError: (error) => {
            setErrorMessage(getErrorMessage(error, 'Không thể tạo kế hoạch tuần.'));
        },
    });

    const approveMutation = useMutation({
        mutationFn: (planId: number) => interventionApi.approvePlan(planId),
        onSuccess: (plan) => {
            setErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ['intervention-plan', plan.id] });
            queryClient.invalidateQueries({ queryKey: ['intervention-plans', selectedClassId] });
        },
        onError: (error) => {
            setErrorMessage(getErrorMessage(error, 'Không thể duyệt kế hoạch.'));
        },
    });

    const completeMutation = useMutation({
        mutationFn: (planId: number) => interventionApi.completePlan(planId),
        onSuccess: (plan) => {
            setErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ['intervention-plan', plan.id] });
            queryClient.invalidateQueries({ queryKey: ['intervention-plans', selectedClassId] });
        },
        onError: (error) => {
            setErrorMessage(getErrorMessage(error, 'Không thể đánh dấu hoàn thành.'));
        },
    });

    const currentPlan = planQuery.data ?? null;

    const selectedClass = useMemo(() => {
        if (!classesQuery.data || selectedClassId === null) {
            return null;
        }
        return classesQuery.data.find((item) => item.id === selectedClassId) ?? null;
    }, [classesQuery.data, selectedClassId]);

    const weekLabel = useMemo(() => `Tuần ${week} (${getIsoWeekRangeLabel(week, year)})`, [week, year]);

    const summary = useMemo(() => {
        if (!currentPlan) {
            return { groups: 0, students: 0 };
        }
        return {
            groups: currentPlan.groups.length,
            students: currentPlan.total_students,
        };
    }, [currentPlan]);

    const onPreviousWeek = () => {
        setWeekState((current) => {
            if (current.week > 1) {
                return { ...current, week: current.week - 1 };
            }
            const previousYear = current.year - 1;
            return { year: previousYear, week: getIsoWeeksInYear(previousYear) };
        });
    };

    const onNextWeek = () => {
        setWeekState((current) => {
            const maxWeeks = getIsoWeeksInYear(current.year);
            if (current.week < maxWeeks) {
                return { ...current, week: current.week + 1 };
            }
            return { year: current.year + 1, week: 1 };
        });
    };

    const handleCreateWorksheet = (group: InterventionGroup) => {
        if (!currentPlan) {
            return;
        }

        const state: InterventionWorksheetPrefillState = {
            source: 'intervention',
            planId: currentPlan.id,
            groupId: group.id,
            classId: currentPlan.class_id,
            grade: currentPlan.grade,
            errorType: group.error_type,
            groupName: group.group_name,
            suggestedActivity: group.suggested_activity,
            suggestedExercises: group.suggested_exercises,
            studentIds: group.student_ids,
            studentNames: group.student_names,
        };

        navigate('/differentiation-wizard', { state });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="container mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                            <CalendarCheck className="h-4 w-4" />
                            Weekly Intervention Planner
                        </div>
                        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Kế hoạch can thiệp tuần</h1>
                        <p className="mt-1 text-slate-500">Gom nhóm học sinh cần hỗ trợ dựa trên điểm số và lỗi sai trong tuần.</p>
                    </div>

                    <div className="w-full md:w-72">
                        <Select
                            value={selectedClassId !== null ? String(selectedClassId) : ''}
                            onValueChange={(value) => {
                                setSelectedClassId(Number(value));
                                setActivePlanId(null);
                            }}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Chọn lớp học" />
                            </SelectTrigger>
                            <SelectContent>
                                {(classesQuery.data || []).map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.class_name} - Lớp {item.grade}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="border-slate-200 bg-white/90">
                    <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={onPreviousWeek}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span>{weekLabel}</span>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={onNextWeek}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => generateMutation.mutate()}
                                disabled={selectedClassId === null || generateMutation.isPending}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                {generateMutation.isPending ? 'Đang tạo...' : 'Tạo kế hoạch'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => currentPlan && approveMutation.mutate(currentPlan.id)}
                                disabled={!currentPlan || currentPlan.status !== 'draft' || approveMutation.isPending}
                            >
                                Duyệt kế hoạch
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => currentPlan && completeMutation.mutate(currentPlan.id)}
                                disabled={!currentPlan || currentPlan.status !== 'approved' || completeMutation.isPending}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Hoàn thành
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {(errorMessage || classesQuery.isError || plansQuery.isError || planQuery.isError) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errorMessage || 'Có lỗi khi tải dữ liệu kế hoạch can thiệp.'}
                        </div>
                    </div>
                )}

                {(classesQuery.isLoading || plansQuery.isLoading || planQuery.isLoading) && (
                    <Skeleton className="h-56 w-full rounded-2xl" />
                )}

                {!classesQuery.isLoading && !classesQuery.isError && (classesQuery.data || []).length === 0 && (
                    <Card>
                        <CardContent className="p-10 text-center text-slate-500">Chưa có lớp học để lập kế hoạch can thiệp.</CardContent>
                    </Card>
                )}

                {selectedClass && !currentPlan && !planQuery.isLoading && !plansQuery.isLoading && (
                    <Card>
                        <CardContent className="space-y-4 p-8 text-center">
                            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                            <p className="font-semibold text-slate-700">Tuần học này chưa có kế hoạch can thiệp.</p>
                            <p className="text-sm text-slate-500">Bấm “Tạo kế hoạch” để hệ thống gom nhóm học sinh từ dữ liệu Thứ 2 đến Thứ 7.</p>
                        </CardContent>
                    </Card>
                )}

                {selectedClass && currentPlan && (
                    <>
                        <Card className="border-indigo-100 bg-white/90">
                            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-indigo-600">{selectedClass.class_name} - Lớp {selectedClass.grade}</p>
                                    <h2 className="text-2xl font-bold text-slate-900">Kế hoạch tuần {currentPlan.week_number}/{currentPlan.year}</h2>
                                </div>
                                <div>{statusBadge(currentPlan.status)}</div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card>
                                <CardContent className="p-5">
                                    <p className="text-sm text-slate-500">Nhóm can thiệp</p>
                                    <p className="text-3xl font-extrabold text-indigo-600">{summary.groups}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-5">
                                    <p className="text-sm text-slate-500">Học sinh cần hỗ trợ</p>
                                    <p className="text-3xl font-extrabold text-amber-600">{summary.students}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-5">
                                    <p className="text-sm text-slate-500">Trạng thái hiện tại</p>
                                    <div className="mt-2">{statusBadge(currentPlan.status)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {currentPlan.groups.length === 0 ? (
                            <Card>
                                <CardContent className="space-y-4 p-8 text-center">
                                    <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                                    <p className="font-semibold text-slate-700">Tuần này chưa có dữ liệu để gom nhóm can thiệp.</p>
                                    <p className="text-sm text-slate-500">Hãy chấm bài và duyệt lỗi sai để hệ thống có dữ liệu đề xuất kế hoạch.</p>
                                    <div>
                                        <Link to="/ai-grading" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                                            Đi tới trang Chấm điểm AI
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {currentPlan.groups.map((group) => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        creatingWorksheet={false}
                                        onCreateWorksheet={handleCreateWorksheet}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
