import { useState, useEffect } from 'react';
import { Plus, Copy } from 'lucide-react';
import { classApi } from '../services/classApi';
import type { MathClass, ClassCreate } from '../services/classApi';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ClassCard, PageHeader } from '@/components/redesign';

export function ClassesPage() {
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
            <div className="p-6">
                <div className="mx-auto max-w-6xl">
                    <PageHeader
                        title="Quản lý lớp học"
                        breadcrumbs={[{ label: 'Teacher', href: '/' }, { label: 'Classes' }]}
                        actions={(
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="w-4 h-4" />
                                Tạo lớp mới
                            </Button>
                        )}
                    />
                    <p className="mb-6 text-sm text-slate-600">Tạo và quản lý các lớp học của bạn</p>

                        {/* Error message */}
                        {error && (
                            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
                                {error}
                                <button onClick={fetchClasses} className="ml-4 underline">Thử lại</button>
                            </div>
                        )}

                        {/* Classes grid */}
                        {classes.length === 0 ? (
                            <Card className="p-12 text-center">
                                <h3 className="mb-2 text-lg font-medium text-gray-700">Chưa có lớp học nào</h3>
                                <p className="mb-6 text-gray-500">Bắt đầu bằng cách tạo lớp học đầu tiên của bạn</p>
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="w-4 h-4" />
                                    Tạo lớp mới
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 [content-visibility:auto]">
                                {classes.map((cls) => (
                                    <div key={cls.id} className="space-y-2">
                                        <ClassCard
                                            className={cls.class_name}
                                            studentCount={cls.student_count}
                                            href={`/classes/${cls.id}`}
                                        />
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-sm">
                                            <Badge className="bg-sky-100 text-sky-700">Lớp {cls.grade}</Badge>
                                            <button
                                                type="button"
                                                className="flex items-center gap-1 rounded px-2 py-1 text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                                                onClick={() => copyClassCode(cls.class_code)}
                                                aria-label={`Sao chép mã lớp ${cls.class_name}`}
                                            >
                                                <span className="font-mono">{cls.class_code}</span>
                                                <Copy className="h-3 w-3" />
                                                {copiedCode === cls.class_code && (
                                                    <span className="text-xs text-green-600">Đã sao chép!</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>

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
    );
}

export default ClassesPage;
