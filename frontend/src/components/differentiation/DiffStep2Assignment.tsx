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
        <Card className="max-w-6xl mx-auto shadow-lg border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50">
                <CardTitle className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Phân nhóm học sinh
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[500px]">
                    {MOCK_TIERS.map((tier) => (
                        <div key={tier.id} className={`flex flex-col rounded-xl border ${tier.color.replace('bg-', 'bg-opacity-20 ')} bg-opacity-30`}>
                            <div className={`p-3 rounded-t-xl font-bold text-sm ${tier.color} flex justify-between items-center`}>
                                {tier.name}
                                <Badge variant="secondary" className="bg-white/50 text-black">
                                    {assignments[tier.id]?.length || 0}
                                </Badge>
                            </div>
                            <div className="p-2 flex-1 space-y-2 bg-gray-50/50">
                                {assignments[tier.id]?.map(studentId => {
                                    const student = getStudentById(studentId);
                                    if (!student) return null;
                                    return (
                                        <div key={student.id} className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 group relative">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">{student.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{student.name}</p>
                                                <p className="text-xs text-gray-500">ĐTB: {student.avgScore}</p>
                                            </div>

                                            {/* Quick move buttons (Mock Interaction) */}
                                            <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white shadow-md rounded-md p-1">
                                                {MOCK_TIERS.filter(t => t.id !== tier.id).map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => handleMoveStudent(student.id, t.id)}
                                                        className={`w-4 h-4 rounded-full ${t.color.split(' ')[0]}`}
                                                        title={`Chuyển sang ${t.name}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!assignments[tier.id] || assignments[tier.id].length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic p-4 border-2 border-dashed border-gray-200 rounded-lg">
                                        <Users className="w-8 h-8 mb-2 opacity-20" />
                                        Chưa có học sinh
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex justify-between items-center border-t border-gray-100 mt-6">
                    <Button variant="outline" onClick={onBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Button>
                    <Button onClick={() => onNext(assignments)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        Tiếp tục <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
