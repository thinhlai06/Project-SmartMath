import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { MOCK_STUDENT_WEAKNESSES } from '../mockData/studentWeaknesses';
import { FileDown, QrCode, Sprout } from 'lucide-react';

interface PdfExportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    worksheetTitle: string;
}

export function PdfExportModal({ open, onOpenChange, worksheetTitle }: PdfExportModalProps) {
    const [mode, setMode] = useState<string>('classroom');

    // Classroom Settings
    const [qrEnabled, setQrEnabled] = useState(true);
    const [parentGuideEnabled, setParentGuideEnabled] = useState(false);
    const [layout, setLayout] = useState('standard'); // standard | eco

    // Personalized Settings
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);

    const selectedStudent = MOCK_STUDENT_WEAKNESSES.find(s => s.studentId === selectedStudentId);

    const handleExport = () => {
        let config;
        if (mode === 'classroom') {
            config = {
                type: 'Classroom PDF',
                qrCodes: qrEnabled,
                parentGuide: parentGuideEnabled,
                layout: layout
            };
        } else {
            config = {
                type: 'Personalized PDF',
                student: selectedStudent?.studentName,
                focusAreas: selectedWeaknesses
            };
        }

        console.log('Export Config:', config);
        alert(`Đang tạo file PDF...\n\nCấu hình:\n${JSON.stringify(config, null, 2)}`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl bg-white shadow-2xl border-2 border-gray-100 p-8 sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileDown className="w-5 h-5 text-blue-600" />
                        Xuất file PDF
                    </DialogTitle>
                    <DialogDescription>
                        Tùy chỉnh định dạng file PDF cho bài tập "{worksheetTitle}"
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="classroom" value={mode} onValueChange={setMode} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="classroom">Lớp học (Đồng loạt)</TabsTrigger>
                        <TabsTrigger value="personalized">Cá nhân hóa</TabsTrigger>
                    </TabsList>

                    <TabsContent value="classroom" className="space-y-6 py-2">
                        <div className="space-y-3">
                            <Label className="font-semibold text-gray-900">Tùy chọn hiển thị</Label>
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <Label htmlFor="qr-mode" className="flex items-center gap-2 cursor-pointer">
                                    <QrCode className="w-4 h-4 text-gray-500" />
                                    <span>Mã QR lời giải</span>
                                </Label>
                                <Switch id="qr-mode" checked={qrEnabled} onCheckedChange={setQrEnabled} />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <Label htmlFor="parent-mode" className="cursor-pointer">Kèm hướng dẫn phụ huynh</Label>
                                <Switch id="parent-mode" checked={parentGuideEnabled} onCheckedChange={setParentGuideEnabled} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-semibold text-gray-900">Bố cục trang in</Label>
                            <RadioGroup value={layout} onValueChange={setLayout} className="grid grid-cols-2 gap-4">
                                <div>
                                    <RadioGroupItem value="standard" id="layout-standard" className="peer sr-only" />
                                    <Label
                                        htmlFor="layout-standard"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-primary"
                                    >
                                        <span className="mb-2 text-xl">📄</span>
                                        Tiêu chuẩn (A4)
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="eco" id="layout-eco" className="peer sr-only" />
                                    <Label
                                        htmlFor="layout-eco"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-primary"
                                    >
                                        <span className="mb-2 text-xl flex"><Sprout className="w-5 h-5 text-green-600 mr-1" />🌱</span>
                                        Tiết kiệm (2 trang/tờ)
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </TabsContent>

                    <TabsContent value="personalized" className="space-y-6 py-2">
                        <div className="space-y-3">
                            <Label>Chọn học sinh</Label>
                            <Select value={selectedStudentId} onValueChange={(val) => {
                                setSelectedStudentId(val);
                                setSelectedWeaknesses([]);
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn học sinh..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_STUDENT_WEAKNESSES.map((s) => (
                                        <SelectItem key={s.studentId} value={s.studentId}>{s.studentName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedStudent && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label>Trọng tâm ôn tập (Dựa trên điểm yếu)</Label>
                                <div className="space-y-2 border rounded-lg p-3 bg-red-50/50">
                                    {selectedStudent.weaknesses.map((w, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`w-${idx}`}
                                                checked={selectedWeaknesses.includes(w)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedWeaknesses([...selectedWeaknesses, w]);
                                                    } else {
                                                        setSelectedWeaknesses(selectedWeaknesses.filter(item => item !== w));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`w-${idx}`}>{w}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleExport} className={mode === 'classroom' ? 'bg-blue-600' : 'bg-purple-600'}>
                        {mode === 'classroom' ? 'Xuất PDF Lớp học' : 'Xuất PDF Cá nhân'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
