import { Users, BookOpen, TrendingUp, Clock, Award, MessageCircle, FileText, Heart } from 'lucide-react';
import type { Screen } from '../App';

interface ParentDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export function ParentDashboard({ onNavigate }: ParentDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Xin chào, Phụ huynh Nguyễn Văn An</h1>
        <p className="text-gray-600">Cẩm nang đồng hành cùng con học toán</p>
      </div>

      {/* Subscription Banner */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6" />
              <h2 className="font-semibold">Gói Premium - Đồng hành tối ưu</h2>
            </div>
            <p className="text-green-50 mb-4">
              Biến phụ huynh thành người đồng hành học tập hiệu quả cho con
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Giải thích bài toán đơn giản</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Theo dõi tiến độ hàng tuần</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Bài tập bổ trợ tự động</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100 mb-1">Hiệu lực đến</p>
            <p className="text-xl font-bold">30/06/2026</p>
          </div>
        </div>
      </div>

      {/* Child Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Tuần này</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">12</p>
          <p className="text-sm text-gray-600">Bài tập đã hoàn thành</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-green-500" />
            <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">Hôm nay</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">25 phút</p>
          <p className="text-sm text-gray-600">Thời gian học tập</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-orange-500" />
            <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">+0.5</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">8.2</p>
          <p className="text-sm text-gray-600">Điểm trung bình</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-teal-500" />
            <span className="text-xs font-medium text-teal-500 bg-teal-50 px-2 py-1 rounded-full">Tốt</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">85%</p>
          <p className="text-sm text-gray-600">Tỷ lệ làm đúng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-gray-900 mb-6">Báo cáo tuần này</h2>
          
          {/* Progress by Topic */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tiến độ theo chủ đề</h3>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Phép chia có dư</span>
                <span className="text-sm font-semibold text-green-600">Đã nắm vững ✓</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Bài toán nhiều bước</span>
                <span className="text-sm font-semibold text-orange-600">Đang luyện tập</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Đổi đơn vị đo</span>
                <span className="text-sm font-semibold text-blue-600">Mới bắt đầu</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>
          </div>

          {/* Learning Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">Nhận xét từ giáo viên</p>
                <p className="text-sm text-blue-800 mb-3">
                  "An đã có tiến bộ rõ rệt trong tuần này! Con rất tập trung và cố gắng. 
                  Cần ôn thêm phần bài toán có nhiều bước để đạt kết quả tốt hơn."
                </p>
                <p className="text-xs text-blue-600">- Cô Lan, Giáo viên lớp 3A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Help */}
        <div className="space-y-6">
          {/* Learning Companion Guide */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Cẩm nang đồng hành</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('parent-solutions')}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Hướng dẫn giải bài</p>
                    <p className="text-xs text-gray-600">Giải thích đơn giản, dễ hiểu</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('student-experience')}
                className="w-full p-4 bg-orange-50 rounded-xl border border-orange-200 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Màn hình học tập của con</p>
                    <p className="text-xs text-gray-600">Xem tiến độ và bài tập</p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Bài tập bổ trợ</p>
                    <p className="text-xs text-gray-600">Luyện thêm tại nhà</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Today's Assignment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Bài tập hôm nay</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Phép chia có dư</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">Hoàn thành</span>
                </div>
                <p className="text-xs text-gray-600">5/5 câu đúng</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">Bài toán tổng hợp</p>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Đang làm</span>
                </div>
                <p className="text-xs text-gray-600">3/8 câu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}