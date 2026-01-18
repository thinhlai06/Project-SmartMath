import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Trash2, Edit2, RefreshCw, Copy, UserCircle, FileText, CheckCircle } from 'lucide-react';
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

const TIER_CONFIG = {
    foundation: { label: 'Nền tảng', color: 'bg-green-100 text-green-700', icon: '🌱' },
    standard: { label: 'Chuẩn', color: 'bg-blue-100 text-blue-700', icon: '📘' },
    extension: { label: 'Mở rộng', color: 'bg-orange-100 text-orange-700', icon: '🔶' },
    advanced: { label: 'Nâng cao', color: 'bg-purple-100 text-purple-700', icon: '💜' },
};

export function ClassDetailPage() {
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
    }, [classId]);

    const fetchClassData = async () => {
        try {
            const data = await classApi.getClass(Number(classId));
            setClassData(data);
        } catch (err) {
            setError('Không thể tải thông tin lớp học');
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const data = await studentApi.getStudents(Number(classId));
            setStudents(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách học sinh');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWorksheets = async () => {
        try {
            const data = await worksheetApi.getWorksheets(Number(classId), 'published');
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
        } catch (err) {
            setError('Không thể thêm học sinh');
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteStudent = async (studentId: number) => {
        if (!confirm('Bạn có chắc muốn xóa học sinh này?')) return;

        try {
            await studentApi.deleteStudent(studentId);
            setStudents(students.filter((s) => s.id !== studentId));
        } catch (err) {
            setError('Không thể xóa học sinh');
            console.error(err);
        }
    };

    const handleRegenerateCode = async () => {
        if (!classData) return;
        if (!confirm('Mã lớp cũ sẽ không còn hiệu lực. Tiếp tục?')) return;

        try {
            const updated = await classApi.regenerateCode(classData.id);
            setClassData(updated);
        } catch (err) {
            setError('Không thể tạo mã mới');
            console.error(err);
        }
    };

    const copyClassCode = () => {
        if (classData) {
            navigator.clipboard.writeText(classData.class_code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/classes')}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách lớp
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-800">{classData?.class_name}</h1>
                            <Badge className={`bg-${classData?.grade === 1 ? 'green' : classData?.grade === 2 ? 'blue' : 'purple'}-100 text-${classData?.grade === 1 ? 'green' : classData?.grade === 2 ? 'blue' : 'purple'}-700`}>
                                Lớp {classData?.grade}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
                            <span className="text-sm text-gray-500">Mã lớp:</span>
                            <span className="font-mono font-bold text-lg">{classData?.class_code}</span>
                            <button onClick={copyClassCode} className="text-gray-400 hover:text-gray-600">
                                <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={handleRegenerateCode} className="text-gray-400 hover:text-gray-600">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            {copiedCode && <span className="text-green-600 text-xs">Đã sao chép!</span>}
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
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {Object.entries(TIER_CONFIG).map(([tier, config]) => (
                        <Card key={tier} className="text-center p-4">
                            <div className="text-2xl mb-1">{config.icon}</div>
                            <div className="text-2xl font-bold">{tierCounts[tier as keyof typeof tierCounts]}</div>
                            <div className="text-sm text-gray-500">{config.label}</div>
                        </Card>
                    ))}
                </div>

                {/* Published Worksheets Section */}
                <Card className="mb-6">
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
                            <div className="space-y-2">
                                {publishedWorksheets.map((ws) => (
                                    <div
                                        key={ws.id}
                                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/worksheets/${ws.id}/edit`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{ws.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {ws.exercise_count} câu hỏi • {ws.worksheet_type === 'cpa' ? 'CPA' : 'Phân hóa'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700">Đã xuất bản</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Students Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Danh sách học sinh ({students.length})
                        </CardTitle>
                        <Button onClick={() => setShowAddStudent(true)} size="sm">
                            <Plus className="w-4 h-4" />
                            Thêm học sinh
                        </Button>
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
                            <div className="space-y-2">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <UserCircle className="w-8 h-8 text-gray-400" />
                                            <span className="font-medium">{student.full_name}</span>
                                            <Badge className={TIER_CONFIG[student.tier as keyof typeof TIER_CONFIG]?.color || 'bg-gray-100'}>
                                                {TIER_CONFIG[student.tier as keyof typeof TIER_CONFIG]?.label || student.tier}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="text-gray-400 hover:text-blue-600 p-1">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-gray-400 hover:text-red-600 p-1"
                                                onClick={() => handleDeleteStudent(student.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Student Modal */}
                {showAddStudent && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Thêm học sinh</h2>
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
                                                    className={`py-2 px-3 rounded-lg border-2 transition-colors text-sm ${newStudent.tier === tier
                                                        ? 'border-teal-500 bg-teal-50'
                                                        : 'border-gray-200 hover:border-gray-300'
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
                                        className="flex-1"
                                        onClick={() => setShowAddStudent(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={isAdding}>
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
