import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { classApi, type Student as ApiStudent } from '../../services/classApi';
import { DIFF_TIERS, isDiffTierId, type DiffTierId } from './tierConfig';

interface DiffStep2AssignmentProps {
    onNext: (assignments: Record<string, string[]>) => void;
    onBack: () => void;
    currentClassId: number | null;
    initialAssignments?: Record<string, string[]>;
    targetStudentIds?: string[];
}

interface AssignmentStudent {
    id: string;
    name: string;
    avgScore: number | null;
    suggestedTier: DiffTierId;
    avatar: string;
}

type AssignmentState = Record<DiffTierId, string[]>;

function normalizeAssignments(assignments?: Record<string, string[]>): AssignmentState {
    const normalized: AssignmentState = {
        foundation: [],
        standard: [],
        extension: [],
        advanced: [],
    };

    if (!assignments) {
        return normalized;
    }

    for (const tier of DIFF_TIERS) {
        normalized[tier.id] = [...(assignments[tier.id] ?? [])];
    }

    return normalized;
}

function suggestTier(avgScore: number | null | undefined): DiffTierId {
    if (avgScore == null) {
        return 'standard';
    }
    if (avgScore < 5.5) {
        return 'foundation';
    }
    if (avgScore < 8.0) {
        return 'standard';
    }
    if (avgScore < 9.0) {
        return 'extension';
    }
    return 'advanced';
}

function getAvatarInitials(fullName: string): string {
    const tokens = fullName.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
        return 'HS';
    }

    return tokens.slice(-2).map((token) => token.charAt(0).toUpperCase()).join('');
}

function mapStudent(apiStudent: ApiStudent): AssignmentStudent {
    const suggestedTier = isDiffTierId(apiStudent.tier)
        ? apiStudent.tier
        : suggestTier(apiStudent.avg_score);

    return {
        id: apiStudent.id.toString(),
        name: apiStudent.full_name,
        avgScore: apiStudent.avg_score ?? null,
        suggestedTier,
        avatar: getAvatarInitials(apiStudent.full_name),
    };
}

function buildAssignmentsFromStudents(
    students: AssignmentStudent[],
    initialAssignments?: Record<string, string[]>,
    targetStudentIds?: string[],
): AssignmentState {
    const nextAssignments = normalizeAssignments(initialAssignments);
    const validStudentIds = new Set(targetStudentIds && targetStudentIds.length > 0
        ? targetStudentIds
        : students.map((student) => student.id));
    const assignedIds = new Set<string>();

    for (const tier of DIFF_TIERS) {
        nextAssignments[tier.id] = nextAssignments[tier.id].filter((studentId) => {
            if (!validStudentIds.has(studentId) || assignedIds.has(studentId)) {
                return false;
            }
            assignedIds.add(studentId);
            return true;
        });
    }

    for (const student of students) {
        if (!validStudentIds.has(student.id)) {
            continue;
        }
        if (!assignedIds.has(student.id)) {
            nextAssignments[student.suggestedTier].push(student.id);
            assignedIds.add(student.id);
        }
    }

    return nextAssignments;
}

export function DiffStep2Assignment({ onNext, onBack, currentClassId, initialAssignments, targetStudentIds }: DiffStep2AssignmentProps) {
    const [assignments, setAssignments] = useState<AssignmentState>(normalizeAssignments(initialAssignments));
    const [seededClassId, setSeededClassId] = useState<number | null>(null);

    const studentsQuery = useQuery<ApiStudent[]>({
        queryKey: ['diff-step2-students', currentClassId],
        queryFn: async () => {
            if (!currentClassId) {
                return [];
            }
            return classApi.getStudents(currentClassId, undefined, 0, 100);
        },
        enabled: currentClassId !== null,
    });

    const students = useMemo(() => (studentsQuery.data ?? []).map(mapStudent), [studentsQuery.data]);
    const studentsById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students]);

    useEffect(() => {
        setSeededClassId(null);
    }, [currentClassId]);

    useEffect(() => {
        if (!currentClassId || seededClassId === currentClassId || !studentsQuery.isFetched) {
            return;
        }

        const nextAssignments = buildAssignmentsFromStudents(students, initialAssignments, targetStudentIds);
        setAssignments(nextAssignments);
        setSeededClassId(currentClassId);
    }, [currentClassId, initialAssignments, seededClassId, students, studentsQuery.isFetched, targetStudentIds]);

    const handleMoveStudent = (studentId: string, targetTier: DiffTierId) => {
        const nextAssignments: AssignmentState = {
            foundation: [...assignments.foundation],
            standard: [...assignments.standard],
            extension: [...assignments.extension],
            advanced: [...assignments.advanced],
        };

        for (const tier of DIFF_TIERS) {
            nextAssignments[tier.id] = nextAssignments[tier.id].filter((id) => id !== studentId);
        }
        nextAssignments[targetTier].push(studentId);

        setAssignments(nextAssignments);
    };

    const hasStudents = students.length > 0;
    const canContinue = !studentsQuery.isLoading && hasStudents;

    if (currentClassId === null) {
        return (
            <Card className="max-w-6xl mx-auto glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
                <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm">
                            <span className="font-extrabold">2</span>
                        </div>
                        Phân nhóm học sinh
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="text-center py-12 text-slate-500 font-medium">
                        Vui lòng chọn lớp học để tải danh sách học sinh.
                    </div>
                    <div className="pt-6 flex justify-between items-center border-t border-slate-100 mt-8">
                        <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 border-slate-200 font-semibold h-11 px-6">
                            <ArrowLeft className="w-4 h-4" /> Quay lại
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-6xl mx-auto glass-panel border-white/50 rounded-3xl overflow-hidden shadow-soft">
            <CardHeader className="bg-white/40 border-b border-white/50 pb-5">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm">
                        <span className="font-extrabold">2</span>
                    </div>
                    Phân nhóm học sinh
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                {studentsQuery.isError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center justify-between gap-4">
                        <span>Không thể tải danh sách học sinh. Vui lòng thử lại.</span>
                        <Button variant="outline" size="sm" onClick={() => studentsQuery.refetch()}>
                            Thử lại
                        </Button>
                    </div>
                )}

                {studentsQuery.isLoading && (
                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium">
                        Đang tải danh sách học sinh...
                    </div>
                )}

                {!studentsQuery.isLoading && !studentsQuery.isError && !hasStudents && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
                        Lớp này chưa có học sinh để phân nhóm.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
                    {DIFF_TIERS.map((tier) => (
                        <div key={tier.id} data-testid={`tier-column-${tier.id}`} className="flex flex-col bg-white/60 border border-white/50 shadow-sm rounded-2xl overflow-hidden backdrop-blur-sm">
                            <div className={`p-4 font-bold text-sm flex justify-between items-center bg-gradient-to-r ${
                                tier.id === 'foundation' ? 'from-emerald-50 to-emerald-100/50 text-emerald-800 border-b border-emerald-100' :
                                tier.id === 'standard' ? 'from-blue-50 to-blue-100/50 text-blue-800 border-b border-blue-100' :
                                tier.id === 'extension' ? 'from-amber-50 to-amber-100/50 text-amber-800 border-b border-amber-100' :
                                'from-rose-50 to-rose-100/50 text-rose-800 border-b border-rose-100'
                            }`}>
                                <span className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                        tier.id === 'foundation' ? 'bg-emerald-500' :
                                        tier.id === 'standard' ? 'bg-blue-500' :
                                        tier.id === 'extension' ? 'bg-amber-500' :
                                        'bg-rose-500'
                                    }`}></span>
                                    {tier.name}
                                </span>
                                <Badge data-testid={`tier-count-${tier.id}`} variant="secondary" className="bg-white text-slate-700 shadow-sm font-bold border-slate-100">
                                    {assignments[tier.id]?.length || 0}
                                </Badge>
                            </div>
                            <div className="p-3 flex-1 space-y-3 bg-slate-50/30">
                                {assignments[tier.id]?.map((studentId) => {
                                    const student = studentsById.get(studentId);
                                    if (!student) {
                                        return null;
                                    }

                                    return (
                                        <div key={student.id} data-testid={`student-card-${student.id}`} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 group relative hover:shadow-md transition-all hover:border-indigo-200">
                                            <Avatar className="w-10 h-10 border-2 border-slate-100">
                                                <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700 font-bold">{student.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate">{student.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">ĐTB: {student.avgScore == null ? '-' : student.avgScore.toFixed(1)}</p>
                                            </div>

                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1.5 bg-white/90 backdrop-blur-sm shadow-md rounded-lg p-1.5 border border-slate-100 z-10">
                                                {DIFF_TIERS.filter((targetTier) => targetTier.id !== tier.id).map((targetTier) => (
                                                    <button
                                                        key={targetTier.id}
                                                        onClick={() => handleMoveStudent(student.id, targetTier.id)}
                                                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform hover:scale-110 ${
                                                            targetTier.id === 'foundation' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' :
                                                            targetTier.id === 'standard' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' :
                                                            targetTier.id === 'extension' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' :
                                                            'bg-rose-100 text-rose-600 hover:bg-rose-200'
                                                        }`}
                                                        title={`Chuyển sang ${targetTier.name}`}
                                                    >
                                                        <span className="text-[10px] font-bold">{targetTier.name.charAt(0)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!assignments[tier.id] || assignments[tier.id].length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                        <Users className="w-8 h-8 mb-3 text-slate-300" />
                                        <span>Chưa có học sinh</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex justify-between items-center border-t border-slate-100 mt-8">
                    <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 border-slate-200 font-semibold h-11 px-6">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Button>
                    <Button
                        disabled={!canContinue}
                        onClick={() => onNext(assignments)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl font-bold h-11 px-8 shadow-md hover:shadow-lg transition-all btn-bounce disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Tiếp tục <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
