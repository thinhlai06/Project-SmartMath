import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_TIERS } from '../../mockData/differentiationData';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface DiffStep2AssignmentProps {
    onNext: (assignments: Record<string, string[]>) => void;
    onBack: () => void;
    initialAssignments?: Record<string, string[]>;
}

export function DiffStep2Assignment({ onNext, onBack, initialAssignments }: DiffStep2AssignmentProps) {
    const [assignments, setAssignments] = useState<Record<string, string[]>>(initialAssignments || {
        foundation: [],
        standard: [],
        extension: [],
        advanced: []
    });

    // Auto-assign mock students based on their recommended tier if empty
    useEffect(() => {
        if (!initialAssignments && Object.values(assignments).every(arr => arr.length === 0)) {
            const newAssignments: Record<string, string[]> = {
                foundation: [],
                standard: [],
                extension: [],
                advanced: []
            };
            MOCK_STUDENTS.forEach(student => {
                if (newAssignments[student.recommendedTier]) {
                    newAssignments[student.recommendedTier].push(student.id);
                }
            });
            setAssignments(newAssignments);
        }
    }, []);

    const handleMoveStudent = (studentId: string, targetTier: string) => {
        const newAssignments = { ...assignments };
        // Remove from all tiers
        Object.keys(newAssignments).forEach(tier => {
            newAssignments[tier] = newAssignments[tier].filter(id => id !== studentId);
        });
        // Add to target
        if (newAssignments[targetTier]) {
            newAssignments[targetTier].push(studentId);
        }
        setAssignments(newAssignments);
    };

    const getStudentById = (id: string) => MOCK_STUDENTS.find(s => s.id === id);

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
                    {MOCK_TIERS.map((tier) => (
                        <div key={tier.id} className="flex flex-col bg-white/60 border border-white/50 shadow-sm rounded-2xl overflow-hidden backdrop-blur-sm">
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
                                <Badge variant="secondary" className="bg-white text-slate-700 shadow-sm font-bold border-slate-100">
                                    {assignments[tier.id]?.length || 0}
                                </Badge>
                            </div>
                            <div className="p-3 flex-1 space-y-3 bg-slate-50/30">
                                {assignments[tier.id]?.map(studentId => {
                                    const student = getStudentById(studentId);
                                    if (!student) return null;
                                    return (
                                        <div key={student.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 group relative hover:shadow-md transition-all hover:border-indigo-200">
                                            <Avatar className="w-10 h-10 border-2 border-slate-100">
                                                <AvatarFallback className="text-xs bg-indigo-50 text-indigo-700 font-bold">{student.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate">{student.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">ĐTB: {student.avgScore}</p>
                                            </div>

                                            {/* Quick move buttons (Mock Interaction) */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1.5 bg-white/90 backdrop-blur-sm shadow-md rounded-lg p-1.5 border border-slate-100 z-10">
                                                {MOCK_TIERS.filter(t => t.id !== tier.id).map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => handleMoveStudent(student.id, t.id)}
                                                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform hover:scale-110 ${
                                                            t.id === 'foundation' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' :
                                                            t.id === 'standard' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' :
                                                            t.id === 'extension' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' :
                                                            'bg-rose-100 text-rose-600 hover:bg-rose-200'
                                                        }`}
                                                        title={`Chuyển sang ${t.name}`}
                                                    >
                                                        <span className="text-[10px] font-bold">{t.name.charAt(0)}</span>
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
                    <Button onClick={() => onNext(assignments)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl font-bold h-11 px-8 shadow-md hover:shadow-lg transition-all btn-bounce">
                        Tiếp tục <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
