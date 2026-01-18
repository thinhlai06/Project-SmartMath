import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Bell, Plus, Trash2, X, Save, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from './ui/badge';

interface Announcement {
    id: number;
    class_id: number;
    title: string;
    content: string;
    created_at: string;
}

interface AnnouncementListProps {
    classId?: number;
    isTeacher?: boolean;
}

const API_BASE = 'http://localhost:8000/api';

export function AnnouncementList({ classId = 1, isTeacher = false }: AnnouncementListProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [error, setError] = useState<string | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/classes/${classId}/announcements`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAnnouncements(data);
            } else {
                setError('Không thể tải thông báo');
            }
        } catch (err) {
            setError('Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleCreate = async () => {
        if (!formData.title.trim() || !formData.content.trim()) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/announcements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    class_id: classId,
                    title: formData.title,
                    content: formData.content
                })
            });
            if (response.ok) {
                setFormData({ title: '', content: '' });
                setIsCreating(false);
                fetchAnnouncements();
            } else {
                const err = await response.json();
                alert(err.detail || 'Không thể tạo thông báo');
            }
        } catch (err) {
            alert('Lỗi kết nối');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchAnnouncements();
            } else {
                alert('Không thể xóa thông báo');
            }
        } catch (err) {
            alert('Lỗi kết nối');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "d MMMM, yyyy 'lúc' HH:mm", { locale: vi });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <Card className="h-full bg-white shadow-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-white/50 border-b border-blue-100/50">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800">Thông báo lớp học</CardTitle>
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        {announcements.length}
                    </Badge>
                </div>
                {isTeacher && !isCreating && (
                    <Button size="sm" onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="w-4 h-4 mr-1" /> Tạo mới
                    </Button>
                )}
            </CardHeader>

            <CardContent className="p-4 overflow-y-auto max-h-[500px]">
                {/* Create Form */}
                {isCreating && (
                    <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Tạo thông báo mới
                            </h4>
                            <Button size="icon" variant="ghost" onClick={() => setIsCreating(false)} className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <Input
                                placeholder="Tiêu đề thông báo..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-white border-blue-200 focus-visible:ring-blue-500 font-medium"
                            />
                            <Textarea
                                placeholder="Nội dung chi tiết..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="bg-white border-blue-200 focus-visible:ring-blue-500 min-h-[100px]"
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => setIsCreating(false)} className="border-gray-200">
                                    Hủy
                                </Button>
                                <Button size="sm" onClick={handleCreate} disabled={!formData.title || !formData.content || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                    Đăng thông báo
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Chưa có thông báo nào</p>
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="group relative p-4 rounded-xl border bg-white border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                            {announcement.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">
                                                {formatDate(announcement.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {isTeacher && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(announcement.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {announcement.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
