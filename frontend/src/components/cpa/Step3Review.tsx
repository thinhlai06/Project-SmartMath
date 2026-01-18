import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Check, Save, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

interface Step3ReviewProps {
    data: any;
    onBack: () => void;
    onSave: () => void;
    isSaving?: boolean;
}

export function Step3Review({ data, onBack, onSave, isSaving = false }: Step3ReviewProps) {
    return (
        <Card className="max-w-4xl mx-auto shadow-lg border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-50">
                <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
                    <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Xem lại & Hoàn tất
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5" /> Đã thiết kế xong!
                    </h3>
                    <p className="text-green-700 text-sm">
                        Vui lòng kiểm tra lại nội dung trước khi lưu vào kho học liệu.
                    </p>
                </div>

                <div className="space-y-6 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <div>
                        <Label className="text-gray-500 uppercase text-xs font-bold tracking-wider">Chủ đề</Label>
                        <p className="text-lg font-semibold text-gray-900">{data.topicId}</p>
                        <p className="text-sm text-gray-500">{data.standard}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-orange-600 font-bold">Concrete</Label>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{data.content?.concrete}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-blue-600 font-bold">Pictorial</Label>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{data.content?.pictorial}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-purple-600 font-bold">Abstract</Label>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">{data.content?.abstract}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold">Bài tập thực hành</Label>
                        <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap font-mono text-gray-700">
                            {data.content?.practice}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                    <Button variant="outline" onClick={onBack} className="gap-2" disabled={isSaving}>
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md hover:shadow-lg"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Lưu học liệu
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

