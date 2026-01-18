import { useState } from 'react';
import { Download, X, FileText, QrCode, Leaf, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';

export interface PdfExportSettings {
    paper_size: 'A4' | 'A5' | 'Letter';
    orientation: 'P' | 'L';
    with_answers: boolean;
    font_size: 'small' | 'medium' | 'large';
    spacing: 'compact' | 'normal' | 'spacious';
    qr_code: boolean;
    eco_layout: boolean;
}

interface PdfExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (settings: PdfExportSettings) => void;
    worksheetTitle: string;
    worksheetType?: 'cpa' | 'differentiation';
    exerciseCount?: number;
    isExporting?: boolean;
}

const PAPER_SIZES = [
    { value: 'A4', label: 'A4' },
    { value: 'A5', label: 'A5' },
    { value: 'Letter', label: 'Letter' },
];

const ORIENTATIONS = [
    { value: 'P', label: 'Dọc' },
    { value: 'L', label: 'Ngang' },
];

const FONT_SIZES = [
    { value: 'small', label: 'Nhỏ' },
    { value: 'medium', label: 'Vừa' },
    { value: 'large', label: 'Lớn' },
];

const SPACING_OPTIONS = [
    { value: 'compact', label: 'Sát' },
    { value: 'normal', label: 'Thường' },
    { value: 'spacious', label: 'Rộng' },
];

// Mock preview data for CPA
const CPA_PREVIEW = {
    concrete: [
        'Bài 1: Cô giáo có 23 cái kẹo muốn chia đều cho 5 bạn học sinh. Hỏi mỗi bạn được bao nhiêu cái kẹo và còn thừa bao nhiêu cái?',
    ],
    pictorial: [
        'Bài 2: Quan sát hình vẽ. Có 17 quả táo được xếp vào các rổ, mỗi rổ 4 quả.',
    ],
    abstract: [
        'Bài 3: Thực hiện phép chia: a) 27 : 6 = ___  b) 35 : 8 = ___',
    ],
};

// Mock preview data for Differentiation  
const DIFF_PREVIEW = {
    foundation: ['1. 15 : 3 = ___', '2. 20 : 4 = ___'],
    standard: ['1. 23 : 5 = ___ (dư ___)', '2. 31 : 7 = ___ (dư ___)'],
    extension: ['Tìm số bị chia, biết số chia là 6, thương là 4, số dư là 3.'],
    advanced: ['Có 87 quyển vở chia đều cho một số học sinh...'],
};

export function PdfExportModal({
    isOpen,
    onClose,
    onExport,
    worksheetTitle,
    worksheetType = 'cpa',
    exerciseCount = 15,
    isExporting
}: PdfExportModalProps) {
    const [settings, setSettings] = useState<PdfExportSettings>({
        paper_size: 'A4',
        orientation: 'P',
        with_answers: false,
        font_size: 'medium',
        spacing: 'normal',
        qr_code: true,
        eco_layout: true,
    });

    if (!isOpen) return null;

    const handleExport = () => {
        onExport(settings);
    };

    const getFontSizeClass = () => {
        switch (settings.font_size) {
            case 'small': return 'text-xs';
            case 'large': return 'text-base';
            default: return 'text-sm';
        }
    };

    const getSpacingClass = () => {
        switch (settings.spacing) {
            case 'compact': return 'space-y-1';
            case 'spacious': return 'space-y-4';
            default: return 'space-y-2';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">📥 Xuất PDF học liệu thông minh</h2>
                            <p className="text-sm text-gray-500">Phân tầng tự động • Tối ưu in ấn • Chuẩn sư phạm CPA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content - 2 Columns */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Column: Settings */}
                    <div className="w-80 border-r p-4 overflow-y-auto bg-gray-50">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            ⚙️ CÀI ĐẶT XUẤT
                        </h3>

                        <div className="space-y-4">
                            {/* Paper size */}
                            <div>
                                <Label className="text-xs font-medium text-gray-600">Khổ giấy</Label>
                                <div className="grid grid-cols-3 gap-1 mt-1">
                                    {PAPER_SIZES.map(({ value }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setSettings({ ...settings, paper_size: value as any })}
                                            className={`py-1.5 text-xs rounded-md border transition-colors ${settings.paper_size === value
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orientation */}
                            <div>
                                <Label className="text-xs font-medium text-gray-600">Chiều giấy</Label>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                    {ORIENTATIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setSettings({ ...settings, orientation: value as any })}
                                            className={`py-1.5 text-xs rounded-md border transition-colors ${settings.orientation === value
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font size */}
                            <div>
                                <Label className="text-xs font-medium text-gray-600">Cỡ chữ</Label>
                                <div className="grid grid-cols-3 gap-1 mt-1">
                                    {FONT_SIZES.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setSettings({ ...settings, font_size: value as any })}
                                            className={`py-1.5 text-xs rounded-md border transition-colors ${settings.font_size === value
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Spacing */}
                            <div>
                                <Label className="text-xs font-medium text-gray-600">Khoảng cách</Label>
                                <div className="grid grid-cols-3 gap-1 mt-1">
                                    {SPACING_OPTIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setSettings({ ...settings, spacing: value as any })}
                                            className={`py-1.5 text-xs rounded-md border transition-colors ${settings.spacing === value
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="my-3" />

                            {/* Toggle options */}
                            <div className="space-y-2">
                                {/* Include answers */}
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                                    <div className="flex items-center gap-2">
                                        <span>📝</span>
                                        <span className="text-xs font-medium">Kèm đáp án</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, with_answers: !settings.with_answers })}
                                        className={`w-10 h-5 rounded-full transition-colors ${settings.with_answers ? 'bg-orange-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.with_answers ? 'translate-x-5' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                {/* QR Code */}
                                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <QrCode className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-medium">QR định danh</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, qr_code: !settings.qr_code })}
                                        className={`w-10 h-5 rounded-full transition-colors ${settings.qr_code ? 'bg-blue-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.qr_code ? 'translate-x-5' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                {/* Eco-Layout */}
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <Leaf className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-medium">Eco-Layout ♻️</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, eco_layout: !settings.eco_layout })}
                                        className={`w-10 h-5 rounded-full transition-colors ${settings.eco_layout ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.eco_layout ? 'translate-x-5' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>
                            </div>

                            {settings.eco_layout && (
                                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                    ♻️ Tiết kiệm ~30% giấy in
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: PDF Preview */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> PDF PREVIEW
                        </h3>

                        {/* Paper Preview */}
                        <div
                            className={`bg-white shadow-lg mx-auto border ${settings.orientation === 'L' ? 'max-w-[600px]' : 'max-w-[400px]'
                                }`}
                            style={{
                                aspectRatio: settings.orientation === 'L' ? '1.414/1' : '1/1.414',
                            }}
                        >
                            <div className="p-4 h-full flex flex-col">
                                {/* PDF Header */}
                                <div className="text-center border-b pb-3 mb-3">
                                    <h4 className="font-bold text-gray-800 uppercase">
                                        BÀI TẬP TOÁN
                                    </h4>
                                    <p className="text-xs text-gray-500">{worksheetTitle}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {worksheetType === 'cpa' ? '🎯 Phương pháp CPA' : '🎯 Phân hóa đa cấp độ'}
                                    </p>
                                </div>

                                {/* Content Preview */}
                                <div className={`flex-1 overflow-y-auto ${getSpacingClass()}`}>
                                    {worksheetType === 'cpa' ? (
                                        <>
                                            {/* CONCRETE Section */}
                                            <div className="border-l-4 border-orange-400 bg-orange-50 p-2 rounded-r">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-orange-600 font-bold text-xs">📙 CONCRETE</span>
                                                    <span className="text-xs text-gray-500">(Cụ thể)</span>
                                                </div>
                                                <div className={getSpacingClass()}>
                                                    {CPA_PREVIEW.concrete.map((q, i) => (
                                                        <p key={i} className={`${getFontSizeClass()} text-gray-700`}>{q}</p>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* PICTORIAL Section */}
                                            <div className="border-l-4 border-blue-400 bg-blue-50 p-2 rounded-r">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-blue-600 font-bold text-xs">🎨 PICTORIAL</span>
                                                    <span className="text-xs text-gray-500">(Hình ảnh)</span>
                                                </div>
                                                <div className={getSpacingClass()}>
                                                    {CPA_PREVIEW.pictorial.map((q, i) => (
                                                        <p key={i} className={`${getFontSizeClass()} text-gray-700`}>{q}</p>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2 mt-2 text-2xl">
                                                    🧺🍎🍎🍎🍎 🧺🍎🍎🍎🍎 🍎
                                                </div>
                                            </div>

                                            {/* ABSTRACT Section */}
                                            <div className="border-l-4 border-purple-400 bg-purple-50 p-2 rounded-r">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-purple-600 font-bold text-xs">🔢 ABSTRACT</span>
                                                    <span className="text-xs text-gray-500">(Trừu tượng)</span>
                                                </div>
                                                <div className={getSpacingClass()}>
                                                    {CPA_PREVIEW.abstract.map((q, i) => (
                                                        <p key={i} className={`${getFontSizeClass()} text-gray-700 font-mono`}>{q}</p>
                                                    ))}
                                                </div>
                                                {settings.with_answers && (
                                                    <div className="mt-2 p-1.5 bg-green-100 rounded text-xs text-green-700">
                                                        ✓ Đáp án: a) 4 dư 3  b) 4 dư 3
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Foundation */}
                                            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-2 rounded-r">
                                                <span className="text-yellow-700 font-bold text-xs">🌱 NỀN TẢNG</span>
                                                <div className={`${getSpacingClass()} mt-1`}>
                                                    {DIFF_PREVIEW.foundation.map((q, i) => (
                                                        <p key={i} className={`${getFontSizeClass()} text-gray-700 font-mono`}>{q}</p>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Standard */}
                                            <div className="border-l-4 border-green-400 bg-green-50 p-2 rounded-r">
                                                <span className="text-green-700 font-bold text-xs">📘 CHUẨN</span>
                                                <div className={`${getSpacingClass()} mt-1`}>
                                                    {DIFF_PREVIEW.standard.map((q, i) => (
                                                        <p key={i} className={`${getFontSizeClass()} text-gray-700 font-mono`}>{q}</p>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Extension */}
                                            <div className="border-l-4 border-orange-400 bg-orange-50 p-2 rounded-r">
                                                <span className="text-orange-700 font-bold text-xs">🔶 MỞ RỘNG</span>
                                                <div className={`${getSpacingClass()} mt-1`}>
                                                    {DIFF_PREVIEW.extension.map((q, i) => (
                                                        <p key={i} className={`${getFontSizeClass()} text-gray-700`}>{q}</p>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Advanced */}
                                            <div className="border-l-4 border-purple-400 bg-purple-50 p-2 rounded-r">
                                                <span className="text-purple-700 font-bold text-xs">💜 NÂNG CAO</span>
                                                <div className={`${getSpacingClass()} mt-1`}>
                                                    {DIFF_PREVIEW.advanced.map((q, i) => (
                                                        <p key={i} className={`${getFontSizeClass()} text-gray-700`}>{q}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* PDF Footer */}
                                <div className="border-t pt-2 mt-2 flex items-center justify-between text-xs text-gray-400">
                                    <span>Smart-MathAI</span>
                                    <div className="flex items-center gap-2">
                                        {settings.qr_code && (
                                            <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                                                <QrCode className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                        <span>Trang 1/3</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview info */}
                        <div className="text-center mt-4 text-xs text-gray-500">
                            Preview • {exerciseCount} câu hỏi • {settings.paper_size} {settings.orientation === 'L' ? 'Ngang' : 'Dọc'}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        📄 {exerciseCount} câu hỏi • {settings.paper_size}
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 px-6"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? 'Đang xuất...' : `📥 Xuất PDF ${exerciseCount} bài`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PdfExportModal;
