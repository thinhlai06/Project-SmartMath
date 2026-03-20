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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin drop-shadow-sm" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            
            <div className="p-6 relative z-10">
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
                            <Card className="glass-panel border-none rounded-3xl p-16 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent -z-10" />
                                <div className="w-24 h-24 bg-indigo-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Plus className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-800">Chưa có lớp học nào</h3>
                                <p className="mb-8 text-slate-500 font-medium">Bắt đầu bằng cách tạo lớp học đầu tiên của bạn cho năm học mới.</p>
                                <Button onClick={() => setShowCreateModal(true)} className="btn-bounce bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-soft px-8 h-12 text-base">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Tạo lớp mới
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 [content-visibility:auto]">
                                {classes.map((cls) => (
                                    <div key={cls.id} className="space-y-3">
                                        <ClassCard
                                            className={cls.class_name}
                                            studentCount={cls.student_count}
                                            href={`/classes/${cls.id}`}
                                        />
                                        <div className="flex items-center justify-between rounded-2xl border-none bg-white/60 backdrop-blur-md shadow-sm px-4 py-3 text-sm">
                                            <Badge className="bg-indigo-100/80 text-indigo-700 rounded-lg hover:bg-indigo-200">Lớp {cls.grade}</Badge>
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-panel border-white/50 bg-white/90 rounded-3xl p-8 w-full max-w-md shadow-2xl">
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
                                                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-300 font-semibold ${newClass.grade === g
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                                        : 'border-slate-100 bg-white hover:border-indigo-200 text-slate-600'
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
                                        className="flex-1 rounded-xl h-12 font-semibold hover:bg-slate-100"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" className="flex-1 rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-soft" disabled={isCreating}>
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
