import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { gradebookApi, type GradebookResponse } from '../services/gradebookApi';
import { classApi } from '../services/classApi';
import { useToast } from '../components/ui/toast';

export function GradebookPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [data, setData] = useState<GradebookResponse | null>(null);
    const [className, setClassName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState<{sId: number, wId: number} | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    useEffect(() => {
        if (classId) {
            fetchData(parseInt(classId));
        }
    }, [classId]);

    const fetchData = async (id: number) => {
        try {
            setLoading(true);
            const [gbData, classData] = await Promise.all([
                gradebookApi.getGradebook(id),
                classApi.getClass(id)
            ]);
            setData(gbData);
            setClassName(classData.class_name);
        } catch (error) {
            console.error(error);
            toast("Không thể tải bảng điểm", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (studentId: number, worksheetId: number, currentScore: number | undefined) => {
        setEditingCell({ sId: studentId, wId: worksheetId });
        setEditValue(currentScore !== undefined ? currentScore.toString() : '');
    };

    const handleSaveCell = async () => {
        if (!editingCell || !data) return;
        
        const score = parseFloat(editValue);
        if (isNaN(score) || score < 0 || score > 10) {
            toast("Điểm phải từ 0 đến 10", "error");
            return;
        }

        try {
            await gradebookApi.saveGrade(editingCell.sId, editingCell.wId, score);
            
            // Update local state optimisticly
            const updatedRecords = data.student_records.map(record => {
                if (record.student_id === editingCell.sId) {
                    return {
                        ...record,
                        grades: {
                            ...record.grades,
                            [editingCell.wId]: score
                        }
                    };
                }
                return record;
            });
            
            setData({ ...data, student_records: updatedRecords });
            setEditingCell(null);
            toast("Đã lưu điểm", "success");
        } catch (error) {
            console.error(error);
            toast("Lỗi khi lưu điểm", "error");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveCell();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    const calculateAverage = (grades: Record<number, number>) => {
        const scores = Object.values(grades);
        if (scores.length === 0) return null;
        const sum = scores.reduce((a, b) => a + b, 0);
        return (sum / scores.length).toFixed(2);
    };

    const handleExport = async () => {
        if (!classId) return;
        try {
            const response = await api.get(`/gradebook/classes/${classId}/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bang_diem_lop_${classId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast('Không thể xuất Excel. Vui lòng thử lại.', 'error');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(`/classes/${classId}`)} className="rounded-xl">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Quay lại lớp học
                        </Button>
                        <h1 className="text-3xl font-extrabold text-slate-800">
                            Bảng điểm lớp {className}
                        </h1>
                    </div>
                    <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md gap-2">
                        <Download className="w-4 h-4" />
                        Xuất Excel
                    </Button>
                </div>

                <Card className="glass-panel border-white/50 rounded-3xl shadow-soft overflow-hidden">
                    <CardHeader className="bg-white/40 border-b border-slate-100">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span>Quản lý điểm số học sinh</span>
                            <span className="text-sm font-medium text-slate-500 bg-white/60 px-3 py-1 rounded-full ml-2">Click vào ô điểm để sửa</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50/80 sticky top-0 shadow-sm border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold rounded-tl-2xl whitespace-nowrap bg-white/80 sticky left-0 z-10">Học sinh</th>
                                    {data.worksheets.map(ws => (
                                        <th key={ws.id} className="px-4 py-4 font-bold text-center border-l border-slate-200/50 min-w-[120px]">
                                            <div className="truncate max-w-[150px] mx-auto" title={ws.title}>{ws.title}</div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 font-bold text-center border-l border-slate-200/50 bg-indigo-50/50 text-indigo-800 whitespace-nowrap">Điểm TB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.student_records.map((student, index) => {
                                    const avg = calculateAverage(student.grades);
                                    return (
                                        <tr key={student.student_id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                            <td className="px-6 py-4 font-medium text-slate-900 bg-white/80 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10 whitespace-nowrap">
                                                {student.full_name}
                                            </td>
                                            {data.worksheets.map(ws => {
                                                const isEditing = editingCell?.sId === student.student_id && editingCell?.wId === ws.id;
                                                const score = student.grades[ws.id];
                                                
                                                return (
                                                    <td key={ws.id} className="px-4 py-3 border-l border-slate-100 text-center relative group">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <input
                                                                    autoFocus
                                                                    type="number"
                                                                    min="0"
                                                                    max="10"
                                                                    step="0.5"
                                                                    className="w-16 h-8 text-center border-2 border-indigo-500 rounded-md focus:outline-none focus:ring-0 font-bold text-indigo-700"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    onKeyDown={handleKeyDown}
                                                                    onBlur={handleSaveCell}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                className={`w-full h-full min-h-[2rem] flex items-center justify-center cursor-pointer rounded-md transition-all font-semibold ${score !== undefined ? (score >= 8 ? 'text-emerald-600' : score < 5 ? 'text-red-500' : 'text-slate-700') : 'text-slate-300 hover:bg-slate-100'}`}
                                                                onClick={() => handleCellClick(student.student_id, ws.id, score)}
                                                            >
                                                                {score !== undefined ? score : '-'}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-6 py-4 text-center border-l border-slate-100 font-bold bg-indigo-50/20 text-indigo-700">
                                                {avg !== null ? avg : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.student_records.length === 0 && (
                                    <tr>
                                        <td colSpan={data.worksheets.length + 2} className="px-6 py-12 text-center text-slate-500 font-medium">
                                            Chưa có học sinh nào trong lớp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
