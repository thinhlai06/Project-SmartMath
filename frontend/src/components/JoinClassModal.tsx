import { useState } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface JoinClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
    const [classCode, setClassCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!classCode.trim() || !studentName.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/parent/join-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    class_code: classCode.toUpperCase(),
                    student_name: studentName
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Đã tham gia lớp ${data.class_name} thành công!`);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setClassCode('');
                    setStudentName('');
                    setSuccess(null);
                }, 1500);
            } else {
                setError(data.detail || 'Không thể tham gia lớp học');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Tham gia lớp học</h2>
                            <p className="text-sm text-gray-500">Nhập mã lớp từ giáo viên</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="classCode">Mã lớp học</Label>
                        <Input
                            id="classCode"
                            type="text"
                            placeholder="Nhập mã lớp (VD: ABC123)"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                            className="mt-1 uppercase"
                            maxLength={10}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Mã lớp được cung cấp bởi giáo viên
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="studentName">Tên con</Label>
                        <Input
                            id="studentName"
                            type="text"
                            placeholder="Nhập tên con (VD: Nguyễn Văn An)"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-600">{success}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Tham gia'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JoinClassModal;
