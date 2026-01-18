import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, Copy, Trash2, Send, EyeOff, ArrowLeft, Download } from 'lucide-react';
import { worksheetApi } from '../services/worksheetApi';
import { classApi } from '../services/classApi';
import type { Worksheet, WorksheetType, WorksheetCreate } from '../services/worksheetApi';
import type { MathClass } from '../services/classApi';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PdfExportModal } from '../components/PdfExportModal';

export function WorksheetsPage() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
    const [mathClass, setMathClass] = useState<MathClass | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, filterType]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [classData, worksheetsData] = await Promise.all([
                classApi.getClass(id),
                worksheetApi.getWorksheets(id, undefined, filterType || undefined)
            ]);
            setMathClass(classData);
            setWorksheets(worksheetsData);
            setNewWorksheet(prev => ({ ...prev, grade: classData.grade }));
        } catch (err) {
            setError('Không thể tải dữ liệu');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateWorksheet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorksheet.title.trim()) return;

        try {
            setIsCreating(true);
            const created = await worksheetApi.createWorksheet(id, newWorksheet);
            // Navigate to editor
            navigate(`/worksheets/${created.id}/edit`);
        } catch (err) {
            setError('Không thể tạo bài tập');
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handlePublish = async (worksheetId: number) => {
        try {
            await worksheetApi.publishWorksheet(worksheetId);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Không thể xuất bản');
        }
    };

    const handleUnpublish = async (worksheetId: number) => {
        try {
            await worksheetApi.unpublishWorksheet(worksheetId);
            fetchData();
        } catch (err) {
            setError('Không thể hủy xuất bản');
        }
    };

    const handleDuplicate = async (worksheetId: number) => {
        try {
            await worksheetApi.duplicateWorksheet(worksheetId);
            fetchData();
        } catch (err) {
            setError('Không thể nhân bản');
        }
    };

    const handleDelete = async (worksheetId: number) => {
        if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
        try {
            await worksheetApi.deleteWorksheet(worksheetId);
            fetchData();
        } catch (err) {
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
                            onClick={() => navigate(`/classes/${id}`)}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" /> Quay lại lớp {mathClass?.class_name}
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Bài tập - {mathClass?.class_name}</h1>
                        <p className="text-gray-500">Quản lý bài tập CPA và phân hóa</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4" />
                        Tạo bài tập mới
                    </Button>
                </div>

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
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                        <button onClick={() => setError(null)} className="ml-4 underline">Đóng</button>
                    </div>
                )}

                {/* Worksheets Grid */}
                {worksheets.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <FileText className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Chưa có bài tập nào</h3>
                        <p className="text-gray-500 mb-6">Tạo bài tập đầu tiên cho lớp học</p>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4" />
                            Tạo bài tập mới
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {worksheets.map((ws) => (
                            <Card key={ws.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle
                                            className="text-lg cursor-pointer hover:text-teal-600"
                                            onClick={() => navigate(`/worksheets/${ws.id}/edit`)}
                                        >
                                            {ws.title}
                                        </CardTitle>
                                        <div className="flex gap-1">
                                            {getTypeBadge(ws.worksheet_type)}
                                            {getStatusBadge(ws.status)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {ws.exercise_count} câu hỏi
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigate(`/worksheets/${ws.id}/edit`)}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                        {ws.status === 'draft' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePublish(ws.id)}
                                            >
                                                <Send className="w-3 h-3" />
                                                Xuất bản
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUnpublish(ws.id)}
                                            >
                                                <EyeOff className="w-3 h-3" />
                                                Hủy
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDuplicate(ws.id)}
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-orange-500 hover:text-orange-700"
                                            onClick={() => handleOpenPdfModal(ws)}
                                        >
                                            <Download className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(ws.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Tạo bài tập mới</h2>
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
                                        <Label>Loại bài tập</Label>
                                        <div className="flex gap-2 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => setNewWorksheet({ ...newWorksheet, worksheet_type: 'cpa' })}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${newWorksheet.worksheet_type === 'cpa'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-medium">CPA</div>
                                                <div className="text-xs text-gray-500">Concrete → Pictorial → Abstract</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewWorksheet({ ...newWorksheet, worksheet_type: 'differentiation' })}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${newWorksheet.worksheet_type === 'differentiation'
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-medium">Phân hóa</div>
                                                <div className="text-xs text-gray-500">4 mức độ khó</div>
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
