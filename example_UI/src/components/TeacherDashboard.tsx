import { BookOpen, FileText, Download, ScanLine, TrendingUp, Users, Clock, Target, Award, AlertCircle } from 'lucide-react';
import type { Screen } from '../App';

interface TeacherDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const quickActions = [
    { icon: BookOpen, label: 'Tạo học liệu CPA', description: 'Sinh bài tập theo phương pháp CPA', screen: 'cpa-designer' as Screen, color: 'from-blue-500 to-blue-600' },
    { icon: Target, label: 'Soạn bài theo mục tiêu', description: 'Phân hoá đa cấp độ', screen: 'differentiation' as Screen, color: 'from-teal-500 to-teal-600' },
    { icon: Download, label: 'Xuất PDF bài tập', description: 'In bài tập có QR code', screen: 'pdf-export' as Screen, color: 'from-green-500 to-green-600' },
    { icon: ScanLine, label: 'Chấm bài bằng AI', description: 'Quét và chấm tự động', screen: 'ai-grading' as Screen, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Xin chào, Cô Lan</h1>
        <p className="text-gray-600">Bảng điều khiển giáo viên - Tiết kiệm 80% thời gian soạn bài</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">+3 tuần này</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">142</p>
          <p className="text-sm text-gray-600">Học sinh đang quản lý</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">↓80%</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">2.5h</p>
          <p className="text-sm text-gray-600">Thời gian soạn bài/tuần</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-teal-500" />
            <span className="text-xs font-medium text-teal-500 bg-teal-50 px-2 py-1 rounded-full">Tháng này</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">48</p>
          <p className="text-sm text-gray-600">Bài tập đã tạo</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-orange-500" />
            <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">8.2/10</p>
          <p className="text-sm text-gray-600">Điểm trung bình lớp</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onNavigate(action.screen)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group text-left"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Error Analytics Summary & Class Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error Analytics Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <h2 className="text-gray-900">Phân tích lỗi phổ biến</h2>
            </div>
            <button
              onClick={() => onNavigate('error-analytics')}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              Xem chi tiết →
            </button>
          </div>

          <div className="space-y-4">
            {[
              { topic: 'Phép chia có dư', errors: 23, percent: 68, trend: 'down' },
              { topic: 'Bài toán có nhiều bước', errors: 18, percent: 52, trend: 'down' },
              { topic: 'Đổi đơn vị đo', errors: 15, percent: 45, trend: 'up' },
            ].map((item, index) => (
              <div key={index} className="border-l-4 border-orange-400 pl-4 py-2 bg-orange-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{item.topic}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.errors} học sinh</span>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-900 font-medium mb-1">💡 Gợi ý giảng dạy</p>
            <p className="text-sm text-blue-700">
              Lớp 3A cần ôn luyện thêm về phép chia có dư. Hệ thống đã tạo sẵn 3 bài tập phân hóa cho em.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-gray-900 mb-6">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[
              { time: '10 phút trước', action: 'Chấm bài kiểm tra lớp 3A', count: '35 bài' },
              { time: '2 giờ trước', action: 'Tạo bài tập CPA "Phép nhân"', count: '4 cấp độ' },
              { time: 'Hôm qua', action: 'Xuất PDF bài tập về nhà', count: '28 học sinh' },
              { time: '2 ngày trước', action: 'Phân tích lỗi chủ đề "Phân số"', count: '15 lỗi' },
            ].map((activity, index) => (
              <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">{activity.action}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <p className="text-xs text-teal-600 font-medium">{activity.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
