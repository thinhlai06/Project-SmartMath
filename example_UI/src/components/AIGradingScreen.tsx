import { ArrowLeft, Camera, ScanLine, CheckCircle, XCircle, AlertTriangle, Upload, Shield } from 'lucide-react';
import { useState } from 'react';

interface AIGradingScreenProps {
  onBack: () => void;
}

export function AIGradingScreen({ onBack }: AIGradingScreenProps) {
  const [scanned, setScanned] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Chấm bài bằng AI</h1>
            <p className="text-gray-600">Quét và chấm bài tự động với OCR</p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">Bảo mật & Ẩn danh</p>
          <p className="text-sm text-blue-700">
            Tất cả dữ liệu học sinh được tự động ẩn danh hóa. Hệ thống chỉ lưu trữ kết quả học tập, không lưu hình ảnh bài làm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Interface */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quét bài làm</h3>
          
          {!scanned ? (
            <div>
              <div className="bg-gray-100 rounded-xl p-12 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <Camera className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4 text-center">
                  Đặt bài làm vào khung hình và chụp ảnh
                </p>
                <button
                  onClick={() => setScanned(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Mở Camera
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">hoặc</p>
                <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 mx-auto">
                  <Upload className="w-4 h-4" />
                  Tải ảnh lên
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-gray-900 rounded-xl mb-4 overflow-hidden">
                <img
                  src="data:image/svg+xml,%3Csvg width='400' height='500' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='10%25' dominant-baseline='middle' text-anchor='middle' fill='%23374151' font-size='14' font-weight='bold'%3EBài tập toán - Lớp 3A%3C/text%3E%3Ctext x='50%25' y='20%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='12'%3ENguyễn Văn An%3C/text%3E%3Ctext x='10%25' y='30%25' fill='%23111827' font-size='14'%3EBài 1: 23 : 5 = 4 (dư 3)%3C/text%3E%3Ctext x='10%25' y='40%25' fill='%23111827' font-size='14'%3EBài 2: 31 : 7 = 4 (dư 2)%3C/text%3E%3Ctext x='10%25' y='50%25' fill='%23111827' font-size='14'%3EBài 3: 45 : 8 = 5 (dư 5)%3C/text%3E%3C/svg%3E"
                  alt="Scanned homework"
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setScanned(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Quét lại
                </button>
                <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all">
                  Xác nhận & chấm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grading Results */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Kết quả chấm</h3>
          
          {scanned ? (
            <div>
              {/* Student Info */}
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 mb-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600">Học sinh</p>
                    <p className="font-semibold text-gray-900">Nguyễn Văn An</p>
                    <p className="text-xs text-gray-500">Lớp 3A • SBD: 01</p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">8.5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OCR Status */}
              <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center gap-2 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Nhận dạng hoàn tất</p>
                  <p className="text-xs text-green-700">3/3 câu trả lời được phát hiện</p>
                </div>
              </div>

              {/* Detected Answers */}
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">Bài 1</p>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 mb-1">23 : 5 = 4 (dư 3)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">ĐÚNG</span>
                    <span className="text-xs text-gray-600">+3 điểm</span>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">Bài 2</p>
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="line-through">31 : 7 = 4 (dư 2)</span>
                  </p>
                  <p className="text-sm text-red-700 mb-2">
                    ✓ Đáp án đúng: 31 : 7 = 4 (dư 3)
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">SAI</span>
                    <span className="text-xs text-gray-600">Lỗi tính số dư</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">Bài 3</p>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 mb-1">45 : 8 = 5 (dư 5)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">ĐÚNG</span>
                    <span className="text-xs text-gray-600">+5.5 điểm</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                  Lưu kết quả
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Quét bài làm để xem kết quả chấm tự động
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Batch Processing */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Chấm hàng loạt</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700 mb-1">Chấm nhiều bài cùng lúc tiết kiệm thời gian</p>
            <p className="text-sm text-gray-500">Hỗ trợ tải lên tối đa 50 ảnh cùng lúc</p>
          </div>
          <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Tải nhiều ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
