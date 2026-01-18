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
import { FileDown, QrCode, Sprout, Eye, BookOpen, User } from 'lucide-react';

interface PdfExportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    worksheetTitle: string;
}

export function PdfExportModal({ open, onOpenChange, worksheetTitle }: PdfExportModalProps) {
    const [mode, setMode] = useState<string>('classroom');
    const [showPreview, setShowPreview] = useState(true);

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
            <DialogContent className="max-w-5xl bg-white shadow-2xl border-2 border-gray-100 p-0 sm:rounded-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Panel: Settings */}
                    <div className="flex-1 p-8 border-r border-gray-100">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileDown className="w-5 h-5 text-blue-600" />
                                Xuất file PDF
                            </DialogTitle>
                            <DialogDescription>
                                Tùy chỉnh định dạng file PDF cho bài tập "{worksheetTitle}"
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="classroom" value={mode} onValueChange={setMode} className="w-full mt-6">
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
                                        <Label htmlFor="parent-mode" className="flex items-center gap-2 cursor-pointer">
                                            <BookOpen className="w-4 h-4 text-gray-500" />
                                            <span>Kèm hướng dẫn phụ huynh</span>
                                        </Label>
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
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-primary cursor-pointer"
                                            >
                                                <span className="mb-2 text-xl">📄</span>
                                                Tiêu chuẩn (A4)
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="eco" id="layout-eco" className="peer sr-only" />
                                            <Label
                                                htmlFor="layout-eco"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-primary cursor-pointer"
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

                        <DialogFooter className="mt-6 pt-4 border-t">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                            <Button onClick={handleExport} className={mode === 'classroom' ? 'bg-blue-600' : 'bg-purple-600'}>
                                {mode === 'classroom' ? 'Xuất PDF Lớp học' : 'Xuất PDF Cá nhân'}
                            </Button>
                        </DialogFooter>
                    </div>

                    {/* Right Panel: Preview */}
                    <div className="w-full lg:w-96 bg-gray-50 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Xem trước PDF
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-xs"
                            >
                                {showPreview ? 'Ẩn' : 'Hiện'}
                            </Button>
                        </div>

                        {showPreview && (
                            <div className="flex-1 animate-in fade-in duration-300">
                                {/* PDF Preview Mock */}
                                <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${layout === 'eco' ? 'flex gap-1' : ''}`}>
                                    {/* Page 1 */}
                                    <div className={`${layout === 'eco' ? 'flex-1 scale-90 origin-top-left' : ''} p-4 space-y-3`}>
                                        {/* Header */}
                                        <div className="border-b border-gray-200 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Smart-MathAI</p>
                                                    <p className="text-xs font-bold text-gray-900">{worksheetTitle}</p>
                                                </div>
                                                {mode === 'personalized' && selectedStudent && (
                                                    <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                                        <User className="w-3 h-3" />
                                                        {selectedStudent.studentName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">1</div>
                                                <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="ml-6 space-y-1">
                                                <div className="h-2 bg-gray-50 rounded w-3/4"></div>
                                                <div className="h-2 bg-gray-50 rounded w-1/2"></div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center text-[8px] font-bold text-orange-600">2</div>
                                                <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="ml-6 space-y-1">
                                                <div className="h-2 bg-gray-50 rounded w-full"></div>
                                                <div className="h-2 bg-gray-50 rounded w-2/3"></div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[8px] font-bold text-green-600">3</div>
                                                <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>

                                        {/* QR Code */}
                                        {qrEnabled && mode === 'classroom' && (
                                            <div className="flex justify-end pt-2 border-t border-dashed border-gray-200">
                                                <div className="text-center">
                                                    <div className="w-10 h-10 bg-gray-900 rounded p-1">
                                                        <div className="w-full h-full bg-white rounded-sm grid grid-cols-3 gap-px p-0.5">
                                                            {[...Array(9)].map((_, i) => (
                                                                <div key={i} className={`${[0, 2, 3, 5, 6, 8].includes(i) ? 'bg-gray-900' : 'bg-white'}`}></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-[6px] text-gray-400 mt-1">Quét để xem đáp án</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Focus Areas for Personalized */}
                                        {mode === 'personalized' && selectedWeaknesses.length > 0 && (
                                            <div className="bg-red-50 rounded p-2 border border-red-100">
                                                <p className="text-[8px] font-bold text-red-700 mb-1">📌 Trọng tâm ôn tập:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedWeaknesses.slice(0, 2).map((w, i) => (
                                                        <span key={i} className="text-[6px] bg-red-100 text-red-600 px-1 py-0.5 rounded">
                                                            {w}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Page 2 (for eco layout) */}
                                    {layout === 'eco' && (
                                        <div className="flex-1 scale-90 origin-top-right p-4 border-l border-gray-200">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-[8px] font-bold text-purple-600">4</div>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                                                </div>
                                                <div className="ml-6 h-2 bg-gray-50 rounded w-3/4"></div>

                                                <div className="flex items-center gap-2 mt-3">
                                                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center text-[8px] font-bold text-teal-600">5</div>
                                                    <div className="flex-1 h-2 bg-gray-100 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Parent Guide Preview */}
                                {parentGuideEnabled && mode === 'classroom' && (
                                    <div className="mt-3 bg-white rounded-lg shadow border border-blue-200 p-3 animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                            <p className="text-[10px] font-bold text-blue-900">Hướng dẫn Phụ huynh</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-1.5 bg-blue-50 rounded w-full"></div>
                                            <div className="h-1.5 bg-blue-50 rounded w-4/5"></div>
                                            <div className="h-1.5 bg-blue-50 rounded w-3/5"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="mt-4 text-center">
                                    <p className="text-[10px] text-gray-400">
                                        {layout === 'eco' ? '2 trang / 1 tờ A4' : '1 trang / 1 tờ A4'}
                                        {parentGuideEnabled && ' + Trang hướng dẫn'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
