import { GraduationCap, Users, BookOpen, Sparkles, Award, TrendingUp } from 'lucide-react';
import type { UserRole } from '../App';

interface WelcomeProps {
  onSelectRole: (role: UserRole) => void;
}

export function Welcome({ onSelectRole }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">MathAI Tutor</h1>
              <p className="text-gray-600">Hệ thống gia sư toán AI</p>
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Tiết kiệm <strong className="text-blue-600">80% thời gian</strong> soạn bài, 
            hỗ trợ phụ huynh đồng hành và cá nhân hóa học tập cho học sinh
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Teacher Card */}
          <button
            onClick={() => onSelectRole('teacher')}
            className="bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Giáo viên</h2>
                <p className="text-gray-600">
                  Công cụ chuyên nghiệp cho giảng dạy và quản lý lớp học
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm">Tạo học liệu CPA tự động</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm">Phân hóa 4 cấp độ cho học sinh</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm">Chấm bài AI và phân tích lỗi thông minh</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">6 công cụ chính</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
                  Bắt đầu →
                </span>
              </div>
            </div>
          </button>

          {/* Parent Card */}
          <button
            onClick={() => onSelectRole('parent')}
            className="bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Phụ huynh</h2>
                <p className="text-gray-600">
                  Cẩm nang đồng hành cùng con học toán hiệu quả
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm">Hướng dẫn giải bài đơn giản, dễ hiểu</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm">Theo dõi tiến độ học tập của con</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm">Bài tập bổ trợ cá nhân hóa tại nhà</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Phương pháp dạy mới</span>
                <span className="text-green-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
                  Bắt đầu →
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Features Highlight */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">80%</div>
              <p className="text-sm text-gray-600">Tiết kiệm thời gian soạn bài</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">CPA</div>
              <p className="text-sm text-gray-600">Phương pháp sư phạm chuẩn</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">AI</div>
              <p className="text-sm text-gray-600">Chấm bài và phân tích thông minh</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Hỗ trợ chương trình GDPT 2018 • Lớp 1-5 • Tiếng Việt
        </p>
      </div>
    </div>
  );
}
