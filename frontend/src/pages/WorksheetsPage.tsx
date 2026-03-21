import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Copy, Trash2, Send, EyeOff, Download } from 'lucide-react';
import { worksheetApi } from '../services/worksheetApi';
import { classApi } from '../services/classApi';
import type { Worksheet, WorksheetType, WorksheetCreate } from '../services/worksheetApi';
import type { MathClass } from '../services/classApi';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PdfExportModal } from '../components/PdfExportModal';
import { PageHeader, WorksheetGridCard } from '@/components/redesign';

export function WorksheetsPage() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterType, setFilterType] = useState<WorksheetType | ''>('');
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedWorksheetForPdf, setSelectedWorksheetForPdf] = useState<Worksheet | null>(null);

    // Form state
    const [newWorksheet, setNewWorksheet] = useState<WorksheetCreate>({
        title: '',
        grade: 1,
        worksheet_type: 'cpa',
        objective: '',
    });
    const [isCreating, setIsCreating] = useState(false);

    const id = parseInt(classId || '0', 10);

    const classQuery = useQuery<MathClass>({
        queryKey: ['class-detail', id],
        queryFn: () => classApi.getClass(id),
        enabled: !!id,
    });

    const worksheetsQuery = useQuery<Worksheet[]>({
        queryKey: ['class-worksheets', id, filterType],
        queryFn: () => worksheetApi.getWorksheets(id, undefined, filterType || undefined),
        enabled: !!id,
    });

    const publishMutation = useMutation({
        mutationFn: (worksheetId: number) => worksheetApi.publishWorksheet(worksheetId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['class-worksheets', id] });
        },
    });

    const unpublishMutation = useMutation({
        mutationFn: (worksheetId: number) => worksheetApi.unpublishWorksheet(worksheetId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['class-worksheets', id] });
        },
    });

    const duplicateMutation = useMutation({
        mutationFn: (worksheetId: number) => worksheetApi.duplicateWorksheet(worksheetId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['class-worksheets', id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (worksheetId: number) => worksheetApi.deleteWorksheet(worksheetId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['class-worksheets', id] });
        },
    });

    const mathClass = classQuery.data ?? null;
    const worksheets = worksheetsQuery.data ?? [];
    const isLoading = classQuery.isLoading || worksheetsQuery.isLoading;
    const queryError = classQuery.error || worksheetsQuery.error;

    useEffect(() => {
        if (mathClass) {
            setNewWorksheet(prev => ({ ...prev, grade: mathClass.grade }));
        }
    }, [mathClass]);

    const handleCreateWorksheet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorksheet.title.trim()) return;

        try {
            setIsCreating(true);
            const created = await worksheetApi.createWorksheet(id, newWorksheet);
            // Navigate to editor
            navigate(`/worksheets/${created.id}/edit`);
        } catch (_err) {
            setError('Không thể tạo bài tập');
            console.error(_err);
        } finally {
            setIsCreating(false);
        }
    };

    const handlePublish = async (worksheetId: number) => {
        try {
            await publishMutation.mutateAsync(worksheetId);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Không thể xuất bản');
        }
    };

    const handleUnpublish = async (worksheetId: number) => {
        try {
            await unpublishMutation.mutateAsync(worksheetId);
        } catch (_err) {
            setError('Không thể hủy xuất bản');
        }
    };

    const handleDuplicate = async (worksheetId: number) => {
        try {
            await duplicateMutation.mutateAsync(worksheetId);
        } catch (_err) {
            setError('Không thể nhân bản');
        }
    };

    const handleDelete = async (worksheetId: number) => {
        if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
        try {
            await deleteMutation.mutateAsync(worksheetId);
        } catch (_err) {
            setError('Không thể xóa bài tập');
        }
    };

    const handleOpenPdfModal = (ws: Worksheet) => {
        setSelectedWorksheetForPdf(ws);
        setShowPdfModal(true);
    };


    const getStatusBadge = (status: string) => {
        if (status === 'published') {
            return <Badge className="bg-green-100 text-green-700">Đã xuất bản</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-600">Nháp</Badge>;
    };

    const getTypeBadge = (type: WorksheetType) => {
        if (type === 'cpa') {
            return <Badge className="bg-blue-100 text-blue-700">CPA</Badge>;
        }
        return <Badge className="bg-purple-100 text-purple-700">Phân hóa</Badge>;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin drop-shadow-sm" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans p-6">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                <PageHeader
                    title={`Bài tập - ${mathClass?.class_name ?? ''}`}
                    breadcrumbs={[
                        { label: 'Classes', href: '/classes' },
                        { label: mathClass?.class_name ?? `Lớp ${id}`, href: `/classes/${id}` },
                        { label: 'Worksheets' },
                    ]}
                    actions={(
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4" />
                            Tạo bài tập mới
                        </Button>
                    )}
                    className="mb-3"
                />
                <p className="mb-6 text-sm text-slate-600">Quản lý bài tập CPA và phân hóa</p>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={filterType === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('')}
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={filterType === 'cpa' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('cpa')}
                    >
                        CPA
                    </Button>
                    <Button
                        variant={filterType === 'differentiation' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('differentiation')}
                    >
                        Phân hóa
                    </Button>
                </div>

                {/* Error */}
                {(error || queryError) && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error || 'Không thể tải dữ liệu'}
                        <button onClick={() => setError(null)} className="ml-4 underline">Đóng</button>
                    </div>
                )}

                {/* Worksheets Grid */}
                {worksheets.length === 0 ? (
                    <Card className="glass-panel border-white/50 rounded-3xl p-16 text-center relative overflow-hidden shadow-soft">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent -z-10" />
                        <div className="w-24 h-24 bg-indigo-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-slate-800">Chưa có bài tập nào</h3>
                        <p className="mb-8 text-slate-500 font-medium">Tạo bài tập đầu tiên cho lớp học của bạn</p>
                        <Button onClick={() => setShowCreateModal(true)} className="btn-bounce bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-soft px-8 h-12 text-base">
                            <Plus className="w-5 h-5 mr-2" />
                            Tạo bài tập mới
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 [content-visibility:auto]">
                        {worksheets.map((ws) => (
                            <div key={ws.id} className="space-y-3 group">
                                <WorksheetGridCard
                                    title={ws.title}
                                    status={ws.status === 'published' ? 'published' : 'draft'}
                                    editHref={`/worksheets/${ws.id}/edit`}
                                    onPdfExport={() => handleOpenPdfModal(ws)}
                                />
                                <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm px-4 py-3">
                                    <div className="flex gap-1">
                                        {getTypeBadge(ws.worksheet_type)}
                                        {getStatusBadge(ws.status)}
                                        <Badge className="bg-slate-100 text-slate-700">{ws.exercise_count} câu</Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {ws.status === 'draft' ? (
                                            <Button size="sm" variant="outline" onClick={() => handlePublish(ws.id)}>
                                                <Send className="w-3 h-3" />
                                                Xuất bản
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" onClick={() => handleUnpublish(ws.id)}>
                                                <EyeOff className="w-3 h-3" />
                                                Hủy
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => handleDuplicate(ws.id)} aria-label={`Nhân bản bài tập ${ws.title}`}>
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-orange-500 hover:text-orange-700"
                                            onClick={() => handleOpenPdfModal(ws)}
                                            aria-label={`Xuất PDF cho ${ws.title}`}
                                        >
                                            <Download className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(ws.id)}
                                            aria-label={`Xóa bài tập ${ws.title}`}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-panel border-white/50 bg-white/90 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 text-slate-800">Tạo bài tập mới</h2>
                            <form onSubmit={handleCreateWorksheet}>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Tiêu đề bài tập</Label>
                                        <Input
                                            id="title"
                                            placeholder="Ví dụ: Bài tập phép cộng trong phạm vi 10"
                                            value={newWorksheet.title}
                                            onChange={(e) => setNewWorksheet({ ...newWorksheet, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-700 font-semibold mb-2 block">Loại bài tập</Label>
                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => setNewWorksheet({ ...newWorksheet, worksheet_type: 'cpa' })}
                                                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 ${newWorksheet.worksheet_type === 'cpa'
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                                                    }`}
                                            >
                                                <div className={`font-bold mb-1 ${newWorksheet.worksheet_type === 'cpa' ? 'text-indigo-700' : 'text-slate-700'}`}>CPA</div>
                                                <div className="text-xs text-slate-500 font-medium">Concrete → Pictorial → Abstract</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewWorksheet({ ...newWorksheet, worksheet_type: 'differentiation' })}
                                                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 ${newWorksheet.worksheet_type === 'differentiation'
                                                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                    : 'border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/30'
                                                    }`}
                                            >
                                                <div className={`font-bold mb-1 ${newWorksheet.worksheet_type === 'differentiation' ? 'text-purple-700' : 'text-slate-700'}`}>Phân hóa</div>
                                                <div className="text-xs text-slate-500 font-medium">4 mức độ khó</div>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="objective">Mục tiêu (tùy chọn)</Label>
                                        <Input
                                            id="objective"
                                            placeholder="Học sinh nắm vững phép cộng..."
                                            value={newWorksheet.objective || ''}
                                            onChange={(e) => setNewWorksheet({ ...newWorksheet, objective: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 rounded-xl h-12 font-semibold hover:bg-slate-100"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" className="flex-1 rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-soft" disabled={isCreating}>
                                        {isCreating ? 'Đang tạo...' : 'Tạo và chỉnh sửa'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PDF Export Modal */}
                {selectedWorksheetForPdf && (
                    <PdfExportModal
                        open={showPdfModal}
                        onOpenChange={setShowPdfModal}
                        worksheetTitle={selectedWorksheetForPdf.title}
                    />
                )}
            </div>
        </div>
    );
}

export default WorksheetsPage;
