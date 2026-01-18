import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ChevronRight, Copy } from 'lucide-react';
import { classApi } from '../services/classApi';
import type { MathClass, ClassCreate } from '../services/classApi';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

export function ClassesPage() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Form state for creating new class
    const [newClass, setNewClass] = useState<ClassCreate>({
        class_name: '',
        grade: 1,
    });
    const [isCreating, setIsCreating] = useState(false);

    // Fetch classes on mount
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setIsLoading(true);
            const data = await classApi.getClasses();
            setClasses(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách lớp học');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClass.class_name.trim()) return;

        try {
            setIsCreating(true);
            const created = await classApi.createClass(newClass);
            setClasses([...classes, created]);
            setShowCreateModal(false);
            setNewClass({ class_name: '', grade: 1 });
        } catch (err) {
            setError('Không thể tạo lớp học');
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const copyClassCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getGradeBadgeColor = (grade: number) => {
        switch (grade) {
            case 1: return 'bg-green-100 text-green-700';
            case 2: return 'bg-blue-100 text-blue-700';
            case 3: return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (isLoading) {
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
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                        >
                            ← Quay lại
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
                        <p className="text-gray-500">Tạo và quản lý các lớp học của bạn</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4" />
                        Tạo lớp mới
                    </Button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                        <button onClick={fetchClasses} className="ml-4 underline">Thử lại</button>
                    </div>
                )}

                {/* Classes grid */}
                {classes.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <Users className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Chưa có lớp học nào</h3>
                        <p className="text-gray-500 mb-6">Bắt đầu bằng cách tạo lớp học đầu tiên của bạn</p>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4" />
                            Tạo lớp mới
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((cls) => (
                            <Card
                                key={cls.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer group"
                                onClick={() => navigate(`/classes/${cls.id}`)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{cls.class_name}</CardTitle>
                                        <Badge className={getGradeBadgeColor(cls.grade)}>
                                            Lớp {cls.grade}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Users className="w-4 h-4" />
                                            <span>{cls.student_count} học sinh</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyClassCode(cls.class_code);
                                            }}
                                        >
                                            <span className="font-mono">{cls.class_code}</span>
                                            <Copy className="w-3 h-3" />
                                            {copiedCode === cls.class_code && (
                                                <span className="text-green-600 text-xs">Đã sao chép!</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end mt-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-sm">Xem chi tiết</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Class Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Tạo lớp học mới</h2>
                            <form onSubmit={handleCreateClass}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="class_name">Tên lớp</Label>
                                        <Input
                                            id="class_name"
                                            placeholder="Ví dụ: 3A, 2B..."
                                            value={newClass.class_name}
                                            onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="grade">Khối lớp</Label>
                                        <div className="flex gap-2 mt-1">
                                            {[1, 2, 3].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setNewClass({ ...newClass, grade: g })}
                                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${newClass.grade === g
                                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    Lớp {g}
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
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={isCreating}>
                                        {isCreating ? 'Đang tạo...' : 'Tạo lớp'}
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

export default ClassesPage;
