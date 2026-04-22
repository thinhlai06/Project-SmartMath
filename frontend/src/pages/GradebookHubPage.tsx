import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import { classApi, type MathClass } from '@/services/classApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GradebookHubPage() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<MathClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setIsLoading(true);
                const data = await classApi.getClasses(0, 100);
                setClasses(data);
            } catch (error) {
                console.error('Khong the tai danh sach lop cho so diem', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClasses();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold text-slate-800">Quản lý sổ điểm theo lớp</h1>
                    <p className="text-slate-600">Chọn lớp học để mở bảng điểm, chỉnh sửa điểm và xuất Excel.</p>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-36 rounded-2xl bg-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : classes.length === 0 ? (
                    <Card className="rounded-2xl border-slate-200">
                        <CardContent className="p-8 text-center text-slate-600">
                            Chưa có lớp học nào để quản lý bảng điểm.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {classes.map((mathClass) => (
                            <Card key={mathClass.id} className="rounded-2xl border-slate-200 shadow-sm">
                                <CardHeader className="space-y-2 pb-3">
                                    <CardTitle className="text-lg font-bold text-slate-800">{mathClass.class_name}</CardTitle>
                                    <div className="text-sm text-slate-500">Mã lớp: {mathClass.class_code}</div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span className="inline-flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Khối {mathClass.grade}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {mathClass.student_count || 0} học sinh
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => navigate(`/classes/${mathClass.id}/gradebook`)}
                                    >
                                        Mở sổ điểm
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
