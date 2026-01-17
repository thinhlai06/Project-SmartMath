import { ArrowLeft, Download, FileText, QrCode, Users, Printer, Settings, Layers, User, Send, BookOpen, Image, Calculator, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface PDFExportScreenProps {
  onBack: () => void;
}

export function PDFExportScreen({ onBack }: PDFExportScreenProps) {
  const [exportType, setExportType] = useState<'classroom' | 'personalized'>('classroom');
  const [selectedClass, setSelectedClass] = useState('3A');
  const [includeQR, setIncludeQR] = useState(true);
  const [paperSize, setPaperSize] = useState('A4');
  const [ecoLayout, setEcoLayout] = useState(true);
  const [includeParentGuide, setIncludeParentGuide] = useState(true);
  const [previewTier, setPreviewTier] = useState<'foundation' | 'extension' | 'advanced'>('extension');

  const classes = [
    { id: '3A', name: 'Lớp 3A', students: 35, distribution: { foundation: 8, extension: 18, advanced: 9 } },
    { id: '3B', name: 'Lớp 3B', students: 32, distribution: { foundation: 10, extension: 15, advanced: 7 } },
    { id: '4A', name: 'Lớp 4A', students: 38, distribution: { foundation: 9, extension: 20, advanced: 9 } },
  ];

  const selectedClassData = classes.find(c => c.id === selectedClass);

  const tiers = [
    { id: 'foundation', name: 'Nền tảng', color: 'green', icon: '🌱', students: selectedClassData?.distribution.foundation || 0 },
    { id: 'extension', name: 'Mở rộng', color: 'blue', icon: '🎯', students: selectedClassData?.distribution.extension || 0 },
    { id: 'advanced', name: 'Nâng cao', color: 'purple', icon: '⭐', students: selectedClassData?.distribution.advanced || 0 },
  ];

  const studentsNeedingSupport = [
    { name: 'Nguyễn Văn An', issues: ['Phép chia có dư', 'Đổi đơn vị'], class: '3A' },
    { name: 'Trần Thị Bình', issues: ['Bài toán nhiều bước'], class: '3A' },
    { name: 'Lê Minh Châu', issues: ['Phân số', 'So sánh số'], class: '3B' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Xuất PDF học liệu thông minh</h1>
            <p className="text-gray-600">Phân tầng tự động • Tối ưu in ấn • Chuẩn sư phạm CPA</p>
          </div>
        </div>
      </div>

      {/* Export Type Toggle */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 inline-flex gap-2">
          <button
            onClick={() => setExportType('classroom')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold ${
              exportType === 'classroom'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-5 h-5" />
            Classroom PDF (Phân tầng lớp học)
          </button>
          <button
            onClick={() => setExportType('personalized')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold ${
              exportType === 'personalized'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5" />
            Personalized Home-PDF (Lấp lỗ hổng)
          </button>
        </div>
      </div>

      {/* CLASSROOM PDF MODE */}
      {exportType === 'classroom' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Class Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Chọn lớp học</h3>
              </div>
              <div className="space-y-2">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      selectedClass === cls.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{cls.name}</span>
                      <span className="text-sm text-gray-600">{cls.students} HS</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{cls.distribution.foundation} NT</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{cls.distribution.extension} MR</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{cls.distribution.advanced} NC</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Three-Tier Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">3 Tầng thử thách</h3>
              </div>
              <div className="space-y-3">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setPreviewTier(tier.id as any)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      previewTier === tier.id
                        ? `border-${tier.color}-500 bg-${tier.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{tier.icon}</span>
                      <span className="font-medium text-gray-900">{tier.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{tier.students} học sinh</span>
                      <QrCode className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Mỗi tầng có mã QR riêng để AI tự động nhận diện khi chấm bài
              </p>
            </div>

            {/* Export Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Cài đặt xuất</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khổ giấy
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                    <option value="Letter">Letter (8.5 × 11 in)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Mã QR định danh</span>
                  </div>
                  <button
                    onClick={() => setIncludeQR(!includeQR)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      includeQR ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        includeQR ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Eco-Layout</span>
                  </div>
                  <button
                    onClick={() => setEcoLayout(!ecoLayout)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      ecoLayout ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        ecoLayout ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {ecoLayout && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-800">
                    ♻️ Tối ưu hóa: Tiết kiệm ~30% diện tích giấy và mực in
                  </p>
                </div>
              )}
            </div>

            {/* Export Button */}
            <button className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Xuất PDF ({selectedClassData?.students || 0} bài)
            </button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Xem trước PDF - Tầng {previewTier === 'foundation' ? 'Nền tảng' : previewTier === 'extension' ? 'Mở rộng' : 'Nâng cao'}</h3>
                </div>
                <div className="flex gap-2">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setPreviewTier(tier.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        previewTier === tier.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tier.icon} {tier.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Preview - CPA Structure */}
              <div className="bg-gray-100 rounded-xl p-8 mb-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                  {/* Header */}
                  <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
                    <h2 className="font-bold text-gray-900 mb-1">BÀI TẬP TOÁN - LỚP 3A</h2>
                    <p className="text-sm text-gray-600">Chủ đề: Phép nhân trong phạm vi 1000 (Bảng nhân 6)</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                      <span className="text-xs font-semibold text-blue-700">
                        {previewTier === 'foundation' && '🌱 Tầng Nền tảng'}
                        {previewTier === 'extension' && '🎯 Tầng Mở rộng'}
                        {previewTier === 'advanced' && '⭐ Tầng Nâng cao'}
                      </span>
                    </div>
                  </div>

                  {/* QR Code for Tier */}
                  {includeQR && (
                    <div className="absolute top-4 right-4">
                      <div className="w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="w-14 h-14 bg-gray-900" style={{
                          backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 2px, #fff 2px, #fff 4px), repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px)',
                        }} />
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">Nhóm {previewTier === 'foundation' ? 'A' : previewTier === 'extension' ? 'B' : 'C'}</p>
                    </div>
                  )}

                  {/* CPA Structure */}
                  <div className="space-y-6">
                    {/* Concrete */}
                    <div className="border-l-4 border-orange-400 pl-4 py-2 bg-orange-50 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-orange-900">Phần 1: Concrete (Cụ thể)</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-800 mb-2">
                          <strong>Bài 1:</strong> {previewTier === 'foundation' 
                            ? 'Có 6 hộp, mỗi hộp có 3 viên bi. Hỏi có tất cả bao nhiêu viên bi?'
                            : previewTier === 'extension'
                            ? 'Một cửa hàng bán 6 hộp bánh, mỗi hộp có 8 cái. Hỏi cửa hàng có bao nhiêu cái bánh?'
                            : 'Một nông trại có 6 chuồng gà. Mỗi chuồng có 12 con gà. Nếu bán đi 15 con, hỏi còn lại bao nhiêu con?'}
                        </p>
                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Phần làm bài:</p>
                          <div className="h-12 border-b border-dashed border-gray-300" />
                        </div>
                      </div>
                    </div>

                    {/* Pictorial */}
                    <div className="border-l-4 border-teal-400 pl-4 py-2 bg-teal-50 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Image className="w-5 h-5 text-teal-600" />
                        <h3 className="font-semibold text-teal-900">Phần 2: Pictorial (Hình ảnh)</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-800 mb-2">
                          <strong>Bài 2:</strong> Quan sát hình và tính
                        </p>
                        <div className="grid grid-cols-6 gap-2 mb-3">
                          {[1, 2, 3, 4, 5, 6].map((box) => (
                            <div key={box} className="border-2 border-teal-300 rounded-lg p-2 bg-teal-50 text-center">
                              <div className="text-lg mb-1">📦</div>
                              <div className="text-xs">{previewTier === 'foundation' ? '3' : previewTier === 'extension' ? '8' : '12'}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">6 × {previewTier === 'foundation' ? '3' : previewTier === 'extension' ? '8' : '12'} = _____</p>
                        </div>
                      </div>
                    </div>

                    {/* Abstract */}
                    <div className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Phần 3: Abstract (Trừu tượng)</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-800 mb-2">
                          <strong>Bài 3:</strong> Tính nhẩm
                        </p>
                        <div className="space-y-2 font-mono">
                          {previewTier === 'foundation' && (
                            <>
                              <div className="flex items-center gap-4">
                                <span>6 × 2 = ___</span>
                                <span>6 × 4 = ___</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>6 × 5 = ___</span>
                                <span>6 × 3 = ___</span>
                              </div>
                            </>
                          )}
                          {previewTier === 'extension' && (
                            <>
                              <div>6 × 8 = ___</div>
                              <div>6 × 12 = ___</div>
                              <div>6 × 15 = ___</div>
                            </>
                          )}
                          {previewTier === 'advanced' && (
                            <>
                              <div>6 × 24 = ___</div>
                              <div>6 × ___ = 96</div>
                              <div>___ × 6 = 132</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Verified pedagogy engine • Auto-grading enabled</span>
                    <span>Trang 1/3</span>
                  </div>
                </div>
              </div>

              {/* Preview Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Cấu trúc Classroom PDF</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• 3 tầng riêng biệt: Nền tảng ({tiers[0].students} HS), Mở rộng ({tiers[1].students} HS), Nâng cao ({tiers[2].students} HS)</li>
                      <li>• Mỗi tầng có mã QR định danh nhóm để AI tự động chấm theo đúng đáp án</li>
                      <li>• Tiến trình CPA: Concrete → Pictorial → Abstract (phù hợp trẻ 6-11 tuổi)</li>
                      <li>• Eco-Layout: Tiết kiệm 30% giấy và mực in nhưng vẫn đảm bảo sinh động</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSONALIZED HOME-PDF MODE */}
      {exportType === 'personalized' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student Selection Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Students Needing Support */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Học sinh cần hỗ trợ</h3>
              </div>
              <div className="space-y-2">
                {studentsNeedingSupport.map((student, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.class}</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{student.issues.length} lỗi</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.issues.map((issue, i) => (
                        <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Dữ liệu từ AI phân tích lỗi sai gần nhất
              </p>
            </div>

            {/* Export Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Cài đặt xuất</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khổ giấy
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Cẩm nang phụ huynh</span>
                  </div>
                  <button
                    onClick={() => setIncludeParentGuide(!includeParentGuide)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      includeParentGuide ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        includeParentGuide ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {includeParentGuide && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      📚 Tự động thêm trang phụ lục giải thích phương pháp sư phạm cho phụ huynh
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Gửi tự động</h3>
              </div>

              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Gửi qua App</p>
                      <p className="text-xs text-gray-600">Thông báo tức thì</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💬</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Gửi qua Zalo</p>
                      <p className="text-xs text-gray-600">Kết nối Zalo OA</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Export Button */}
            <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Tạo & gửi PDF cá nhân
            </button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Xem trước PDF cá nhân - Nguyễn Văn An</h3>
              </div>

              {/* PDF Preview - Personalized */}
              <div className="bg-gray-100 rounded-xl p-8 mb-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                  {/* Header */}
                  <div className="text-center mb-6 border-b-2 border-blue-200 pb-4">
                    <h2 className="font-bold text-blue-900 mb-1">BÀI TẬP BỔ TRỢ CÁ NHÂN</h2>
                    <p className="text-sm text-gray-600">Lấp lỗ hổng kiến thức - Dành riêng cho con</p>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900">Nguyễn Văn An - Lớp 3A</p>
                      <p className="text-xs text-blue-700 mt-1">Ngày tạo: {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Targeted Exercises */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-red-400 pl-4 py-2 bg-red-50 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🎯</span>
                        <h3 className="font-semibold text-red-900">Lỗi đã phát hiện: Phép chia có dư</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 space-y-4">
                        <div>
                          <p className="text-xs text-red-700 mb-2">⚠️ Lỗi: Tính sai số dư</p>
                          <p className="text-gray-800 mb-2">
                            <strong>Bài 1:</strong> Có 23 cái kẹo chia đều cho 5 bạn. Mỗi bạn được bao nhiêu cái và thừa bao nhiêu?
                          </p>
                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Bài giải:</p>
                            <div className="h-16 border-b border-dashed border-gray-300" />
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-800 mb-2">
                            <strong>Bài 2:</strong> 31 : 7 = ? (dư ?)
                          </p>
                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="h-12 border-b border-dashed border-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-orange-400 pl-4 py-2 bg-orange-50 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🎯</span>
                        <h3 className="font-semibold text-orange-900">Lỗi đã phát hiện: Đổi đơn vị đo</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 space-y-4">
                        <div>
                          <p className="text-xs text-orange-700 mb-2">⚠️ Lỗi: Nhầm hệ số quy đổi</p>
                          <p className="text-gray-800 mb-2">
                            <strong>Bài 3:</strong> Đổi: 3m 25cm = ___ cm
                          </p>
                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="h-12 border-b border-dashed border-gray-300" />
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-800 mb-2">
                            <strong>Bài 4:</strong> Đổi: 450cm = ___ m ___ cm
                          </p>
                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="h-12 border-b border-dashed border-gray-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                    Personalized worksheet • AI-detected gaps • Trang 1/2
                  </div>
                </div>
              </div>

              {/* Parent Guide Preview */}
              {includeParentGuide && (
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200 mb-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">📚 Trang 2: Cẩm nang phụ huynh</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Giải thích từng bước cách giải bài toán theo phương pháp mới</li>
                        <li>• Không sử dụng ẩn số (x) hay phương pháp cũ</li>
                        <li>• Mẹo đồng hành: Sử dụng đồ vật cụ thể, kiên nhẫn lắng nghe</li>
                        <li>• Những lỗi thường gặp và cách tránh</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-1">Personalized Home-PDF</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Phiếu bài tập độc bản dựa trên lỗi sai cụ thể của học sinh</li>
                      <li>• Tự động gửi qua App hoặc Zalo để phụ huynh in tại nhà</li>
                      <li>• Kèm cẩm nang lời giải dành cho cha mẹ (phương pháp sư phạm mới)</li>
                      <li>• Giúp con "lấp lỗ hổng" ngay tại nhà, không đau đớn, bảo vệ thị lực</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
