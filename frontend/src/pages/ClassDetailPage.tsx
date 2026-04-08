import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Trash2, Edit2, RefreshCw, Copy, UserCircle, FileText, CheckCircle, Upload } from 'lucide-react';
import { classApi, studentApi } from '../services/classApi';
import { worksheetApi } from '../services/worksheetApi';
import type { MathClass, Student, StudentCreate } from '../services/classApi';
import type { Worksheet } from '../services/worksheetApi';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnnouncementList } from '../components/AnnouncementList';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';

const TIER_CONFIG = {
    foundation: { label: 'Nền tảng', color: 'bg-green-100 text-green-700', icon: '🌱' },
    standard: { label: 'Chuẩn', color: 'bg-blue-100 text-blue-700', icon: '📘' },
    extension: { label: 'Mở rộng', color: 'bg-orange-100 text-orange-700', icon: '🔶' },
    advanced: { label: 'Nâng cao', color: 'bg-purple-100 text-purple-700', icon: '💜' },
};

export function ClassDetailPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();

    const [classData, setClassData] = useState<MathClass | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [publishedWorksheets, setPublishedWorksheets] = useState<Worksheet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('all');
    const [copiedCode, setCopiedCode] = useState(false);
    const [studentSkip, setStudentSkip] = useState(0);
    const [worksheetSkip, setWorksheetSkip] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showStudentProfile, setShowStudentProfile] = useState(false);
    const pageLimit = 10;
    const excelFileInputRef = useRef<HTMLInputElement | null>(null);

    // New student form
    const [newStudent, setNewStudent] = useState<StudentCreate>({
        full_name: '',
        tier: 'standard',
    });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (classId) {
            fetchClassData();
            fetchStudents();
            fetchWorksheets();
        }
    }, [classId, studentSkip, worksheetSkip]);

    const fetchClassData = async () => {
        try {
            const data = await classApi.getClass(Number(classId));
            setClassData(data);
        } catch (err) {
            setError('Không thể tải thông tin lớp học');
            toast('Không thể tải thông tin lớp học', 'error');
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const data = await studentApi.getStudents(Number(classId), undefined, studentSkip, pageLimit);
            setStudents(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách học sinh');
            toast('Không thể tải danh sách học sinh', 'error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWorksheets = async () => {
        try {
            const data = await worksheetApi.getWorksheets(Number(classId), 'published', undefined, worksheetSkip, pageLimit);
            setPublishedWorksheets(data);
        } catch (err) {
            console.error('Error fetching worksheets:', err);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.full_name.trim()) return;

        try {
            setIsAdding(true);
            const created = await studentApi.createStudent(Number(classId), newStudent);
            setStudents([...students, created]);
            setShowAddStudent(false);
            setNewStudent({ full_name: '', tier: 'standard' });
            toast('Đã thêm học sinh mới', 'success');
        } catch (err) {
            setError('Không thể thêm học sinh');
            toast('Không thể thêm học sinh', 'error');
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile || !classId) {
            return;
        }

        toast('Đang import file Excel, vui lòng chờ...', 'info');
        try {
            const importedStudents = await classApi.uploadStudentsExcel(Number(classId), selectedFile);
            await fetchStudents();
            toast(`Đã import ${importedStudents.length} học sinh`, 'success');
        } catch (err: any) {
            const apiMessage = err?.response?.data?.detail;
            const errorMessage = typeof apiMessage === 'string' ? apiMessage : 'Không thể import file Excel';
            setError(errorMessage);
            toast(errorMessage, 'error');
        } finally {
            e.target.value = '';
        }
    };

    const handleDeleteStudent = async (studentId: number) => {
        if (!confirm('Bạn có chắc muốn xóa học sinh này?')) return;

        try {
            await studentApi.deleteStudent(studentId);
            setStudents(students.filter((s) => s.id !== studentId));
            toast('Đã xóa học sinh', 'success');
        } catch (err) {
            setError('Không thể xóa học sinh');
            toast('Không thể xóa học sinh', 'error');
            console.error(err);
        }
    };

    const handleRegenerateCode = async () => {
        if (!classData) return;
        if (!confirm('Mã lớp cũ sẽ không còn hiệu lực. Tiếp tục?')) return;

        try {
            const updated = await classApi.regenerateCode(classData.id);
            setClassData(updated);
            toast('Đã tạo mã lớp mới', 'success');
        } catch (err) {
            setError('Không thể tạo mã mới');
            toast('Không thể tạo mã lớp mới', 'error');
            console.error(err);
        }
    };

    const copyClassCode = () => {
        if (classData) {
            navigator.clipboard.writeText(classData.class_code);
            setCopiedCode(true);
            toast('Đã sao chép mã lớp', 'success');
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const openStudentProfile = (student: Student) => {
        setSelectedStudent(student);
        setShowStudentProfile(true);
    };

    const formatDate = (value?: string | null) => {
        if (!value) return 'Chưa cập nhật';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('vi-VN');
    };

    const getAvgScoreLabel = (score?: number | null) => {
        if (score === undefined || score === null) return '-';
        return score.toFixed(1);
    };

    const getAvgScoreColor = (score?: number | null) => {
        if (score === undefined || score === null) return 'text-slate-500';
        if (score >= 8) return 'text-emerald-600';
        if (score < 6) return 'text-orange-500';
        return 'text-indigo-600';
    };

    const filteredStudents = selectedTier === 'all'
        ? students
        : students.filter((s) => s.tier === selectedTier);

    const tierCounts = {
        all: students.length,
        foundation: students.filter((s) => s.tier === 'foundation').length,
        standard: students.filter((s) => s.tier === 'standard').length,
        extension: students.filter((s) => s.tier === 'extension').length,
        advanced: students.filter((s) => s.tier === 'advanced').length,
    };

    if (isLoading && !classData) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl space-y-6">
                    <Skeleton className="h-12 w-72 rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-32 rounded-3xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden font-sans p-6">
            <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-indigo-300/30 rounded-full blur-[120px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-300/30 rounded-full blur-[120px] -z-0 pointer-events-none" />
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/classes')}
                            className="text-sm text-slate-500 hover:text-indigo-600 mb-2 flex items-center gap-1 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách lớp
                        </button>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{classData?.class_name}</h1>
                            <Badge className="bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200 text-sm px-3 py-1 rounded-lg">
                                Lớp {classData?.grade}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center gap-3 glass-panel rounded-2xl px-5 py-3 shadow-sm border-white/50">
                            <span className="text-sm font-semibold text-slate-500">Mã lớp:</span>
                            <span className="font-mono font-bold text-xl text-slate-800 tracking-wider bg-white/50 px-2 py-0.5 rounded-md">{classData?.class_code}</span>
                            <div className="flex gap-1 ml-2 border-l border-slate-200 pl-3">
                                <button onClick={copyClassCode} className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors" title="Sao chép mã">
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button onClick={handleRegenerateCode} className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors" title="Tạo mã mới">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            {copiedCode && <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg animate-fade-in-up">Đã sao chép!</span>}
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    {Object.entries(TIER_CONFIG).map(([tier, config]) => (
                        <Card key={tier} className="glass-panel border-white/50 text-center p-5 rounded-3xl shadow-soft hover:shadow-md transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125" />
                            <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform drop-shadow-sm">{config.icon}</div>
                            <div className="text-3xl font-black text-slate-800 drop-shadow-sm">{tierCounts[tier as keyof typeof tierCounts]}</div>
                            <div className="text-sm font-semibold text-slate-500 mt-1">{config.label}</div>
                        </Card>
                    ))}
                </div>

                {/* Published Worksheets Section */}
                <Card className="mb-8 glass-panel border-white/50 rounded-3xl shadow-soft overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Bài tập đã giao ({publishedWorksheets.length})
                        </CardTitle>
                        <Button onClick={() => navigate(`/classes/${classId}/worksheets`)} size="sm" variant="outline">
                            Quản lý bài tập →
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {publishedWorksheets.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                <p>Chưa có bài tập nào được xuất bản</p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => navigate(`/classes/${classId}/worksheets`)}
                                >
                                    Tạo bài tập mới →
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {publishedWorksheets.map((ws) => (
                                        <div
                                            key={ws.id}
                                            className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-emerald-100/50 rounded-2xl hover:bg-emerald-50 hover:shadow-soft transition-all cursor-pointer group"
                                            onClick={() => navigate(`/worksheets/${ws.id}/edit`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-emerald-100/80 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600 drop-shadow-sm" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors cursor-pointer">{ws.title}</p>
                                                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                                                        {ws.exercise_count} câu hỏi • <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{ws.worksheet_type === 'cpa' ? 'CPA' : 'Phân hóa'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Đã xuất bản</Badge>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setWorksheetSkip((prev) => Math.max(0, prev - pageLimit))} disabled={worksheetSkip === 0}>Previous</Button>
                                    <Button variant="outline" size="sm" onClick={() => setWorksheetSkip((prev) => prev + pageLimit)} disabled={publishedWorksheets.length < pageLimit}>Next</Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Students Section */}
                <Card className="glass-panel border-white/50 rounded-3xl shadow-soft overflow-hidden mb-8">
                    <CardHeader className="flex flex-row items-center justify-between bg-white/40 border-b border-white/20">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Danh sách học sinh ({students.length})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <input
                                ref={excelFileInputRef}
                                type="file"
                                accept=".xlsx"
                                className="hidden"
                                onChange={handleExcelImport}
                            />
                            <Button variant="outline" size="sm" onClick={() => excelFileInputRef.current?.click()}>
                                <Upload className="w-4 h-4" />
                                Import Excel
                            </Button>
                            <Button onClick={() => setShowAddStudent(true)} size="sm">
                                <Plus className="w-4 h-4" />
                                Thêm học sinh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Tier filter tabs */}
                        <Tabs value={selectedTier} onValueChange={setSelectedTier} className="mb-4">
                            <TabsList>
                                <TabsTrigger value="all">Tất cả ({tierCounts.all})</TabsTrigger>
                                {Object.entries(TIER_CONFIG).map(([tier, config]) => (
                                    <TabsTrigger key={tier} value={tier}>
                                        {config.icon} {config.label} ({tierCounts[tier as keyof typeof tierCounts]})
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        {/* Students list */}
                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Chưa có học sinh nào</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {filteredStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-slate-100/50 rounded-2xl hover:bg-white hover:shadow-soft transition-all cursor-pointer"
                                            onClick={() => openStudentProfile(student)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                    <UserCircle className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <span className="font-bold text-slate-800">{student.full_name}</span>
                                                <Badge className={`${TIER_CONFIG[student.tier as keyof typeof TIER_CONFIG]?.color || 'bg-slate-100'} hover:opacity-90 transition-opacity`}>
                                                    {TIER_CONFIG[student.tier as keyof typeof TIER_CONFIG]?.label || student.tier}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeleteStudent(student.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setStudentSkip((prev) => Math.max(0, prev - pageLimit))} disabled={studentSkip === 0}>Previous</Button>
                                    <Button variant="outline" size="sm" onClick={() => setStudentSkip((prev) => prev + pageLimit)} disabled={students.length < pageLimit}>Next</Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Announcements Section */}
                <div className="mt-6">
                    <AnnouncementList classId={Number(classId)} isTeacher={true} />
                </div>

                <Dialog open={showStudentProfile} onOpenChange={setShowStudentProfile}>
                    <DialogContent className="sm:max-w-md rounded-3xl border-white/60 bg-white/95">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-extrabold text-slate-800">Hồ sơ học sinh</DialogTitle>
                            <DialogDescription>Thông tin chi tiết và năng lực hiện tại của học sinh</DialogDescription>
                        </DialogHeader>

                        {selectedStudent && (
                            <div className="space-y-4">
                                <div className="rounded-2xl bg-indigo-50/70 p-4">
                                    <p className="text-sm font-semibold text-slate-500">Họ và tên</p>
                                    <p className="text-lg font-bold text-slate-800">{selectedStudent.full_name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-slate-200 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày sinh</p>
                                        <p className="mt-1 font-semibold text-slate-800">{formatDate(selectedStudent.dob)}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm năng lực</p>
                                        <p className="mt-1 font-semibold text-slate-800">
                                            {TIER_CONFIG[selectedStudent.tier as keyof typeof TIER_CONFIG]?.label || selectedStudent.tier}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phụ huynh</p>
                                        <p className="mt-1 font-semibold text-slate-800">{selectedStudent.parent_name || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SĐT phụ huynh</p>
                                        <p className="mt-1 font-semibold text-slate-800">{selectedStudent.parent_phone || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-slate-100 p-4">
                                    <p className="text-sm font-semibold text-slate-500">Điểm trung bình</p>
                                    <p className={`text-3xl font-black ${getAvgScoreColor(selectedStudent.avg_score)}`}>
                                        {getAvgScoreLabel(selectedStudent.avg_score)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Add Student Modal */}
                {showAddStudent && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-panel border-white/50 bg-white/90 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Thêm học sinh</h2>
                            <form onSubmit={handleAddStudent}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="full_name">Họ và tên</Label>
                                        <Input
                                            id="full_name"
                                            placeholder="Nguyễn Văn A"
                                            value={newStudent.full_name}
                                            onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Nhóm năng lực</Label>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            {Object.entries(TIER_CONFIG).map(([tier, config]) => (
                                                <button
                                                    key={tier}
                                                    type="button"
                                                    onClick={() => setNewStudent({ ...newStudent, tier: tier as StudentCreate['tier'] })}
                                                    className={`py-3 px-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-1 ${newStudent.tier === tier
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                                        : 'border-slate-100 bg-white hover:border-indigo-200 text-slate-600'
                                                        }`}
                                                >
                                                    {config.icon} {config.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 rounded-xl h-12 font-semibold hover:bg-slate-100"
                                        onClick={() => setShowAddStudent(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" className="flex-1 rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-soft" disabled={isAdding}>
                                        {isAdding ? 'Đang thêm...' : 'Thêm học sinh'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClassDetailPage;
