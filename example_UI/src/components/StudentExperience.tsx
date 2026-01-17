import { BookOpen, QrCode, Trophy, Star, Calendar, Target, Zap, ArrowLeft } from 'lucide-react';

export function StudentExperience() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button for Parent */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại trang phụ huynh
        </button>
      </div>

      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl">👋</span>
        </div>
        <h1 className="text-gray-900 mb-2">Xin chào An!</h1>
        <p className="text-gray-600">Hãy cùng học toán vui vẻ nhé</p>
      </div>

      {/* Achievement Banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h2 className="font-bold mb-1">Làm tốt lắm!</h2>
              <p className="text-yellow-100">Tuần này em đã hoàn thành 12 bài tập</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900 mb-1">48</p>
          <p className="text-sm text-gray-600">Ngôi sao đã nhận</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900 mb-1">5</p>
          <p className="text-sm text-gray-600">Ngày học liên tiếp</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900 mb-1">85%</p>
          <p className="text-sm text-gray-600">Tỷ lệ làm đúng</p>
        </div>
      </div>

      {/* Today's Mission */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-gray-900">Nhiệm vụ hôm nay</h2>
        </div>

        <div className="space-y-4">
          {/* Completed Mission */}
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phép chia có dư</h3>
                  <p className="text-sm text-gray-600">5 bài tập</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div className="bg-green-500 rounded-full h-2 w-full" />
          </div>

          {/* Active Mission */}
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bài toán tổng hợp</h3>
                  <p className="text-sm text-gray-600">8 bài tập</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">3/8</p>
                <p className="text-xs text-gray-500">Đang làm</p>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-2 w-full">
              <div className="bg-blue-500 rounded-full h-2" style={{ width: '37.5%' }} />
            </div>
          </div>

          {/* Locked Mission */}
          <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Đổi đơn vị đo</h3>
                  <p className="text-sm text-gray-500">Hoàn thành bài trên để mở</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scan Entry Point */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center shadow-lg mb-6">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="font-bold mb-2">Bắt đầu học bài mới</h2>
        <p className="text-purple-100 mb-6">
          Quét mã QR trên phiếu bài tập hoặc sách giáo khoa
        </p>
        <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-xl transition-all">
          Mở máy quét QR
        </button>
      </div>

      {/* Learning Path */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-gray-900 mb-6">Lộ trình học tập</h2>
        <div className="space-y-3">
          {[
            { topic: 'Phép cộng trong phạm vi 1000', status: 'completed', stars: 5 },
            { topic: 'Phép trừ trong phạm vi 1000', status: 'completed', stars: 5 },
            { topic: 'Phép nhân với 2, 3, 4', status: 'completed', stars: 4 },
            { topic: 'Phép chia có dư', status: 'completed', stars: 5 },
            { topic: 'Bài toán có nhiều bước', status: 'active', stars: 0 },
            { topic: 'Đổi đơn vị đo độ dài', status: 'locked', stars: 0 },
            { topic: 'Phân số đơn giản', status: 'locked', stars: 0 },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                item.status === 'completed'
                  ? 'bg-green-50 border border-green-200'
                  : item.status === 'active'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200 opacity-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                  item.status === 'completed'
                    ? 'bg-green-500'
                    : item.status === 'active'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
              >
                {item.status === 'completed' ? (
                  '✓'
                ) : item.status === 'active' ? (
                  index + 1
                ) : (
                  '🔒'
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.topic}</p>
              </div>
              {item.status === 'completed' && (
                <div className="flex gap-0.5">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}