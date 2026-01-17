import { ArrowLeft, TrendingUp, AlertCircle, Users, Target, Lightbulb, BarChart3 } from 'lucide-react';

interface ErrorAnalyticsProps {
  onBack: () => void;
}

export function ErrorAnalytics({ onBack }: ErrorAnalyticsProps) {
  const commonErrors = [
    {
      topic: 'Phép chia có dư',
      category: 'Số học',
      students: 23,
      percent: 68,
      errorType: 'Sai khi tính số dư',
      trend: 'down',
      recommendations: [
        'Sử dụng đồ vật cụ thể để minh họa',
        'Luyện tập thêm 5-7 bài tương tự',
        'Ôn lại khái niệm "số dư < số chia"',
      ],
    },
    {
      topic: 'Bài toán có nhiều bước',
      category: 'Tư duy',
      students: 18,
      percent: 52,
      errorType: 'Thiếu bước giải hoặc sai thứ tự',
      trend: 'down',
      recommendations: [
        'Hướng dẫn phân tích đề bài từng bước',
        'Sử dụng sơ đồ tư duy',
        'Thực hành đọc hiểu đề bài',
      ],
    },
    {
      topic: 'Đổi đơn vị đo',
      category: 'Đo lường',
      students: 15,
      percent: 45,
      errorType: 'Nhầm hệ số quy đổi',
      trend: 'up',
      recommendations: [
        'Tạo bảng quy đổi trực quan',
        'Thực hành với đồ dùng thực tế',
        'Làm bài tập kết hợp nhiều đơn vị',
      ],
    },
    {
      topic: 'Phân số đơn giản',
      category: 'Phân số',
      students: 12,
      percent: 35,
      errorType: 'So sánh phân số sai',
      trend: 'stable',
      recommendations: [
        'Dùng hình vẽ minh họa phân số',
        'Ôn lại quy đồng mẫu số',
        'Luyện tập thêm bài so sánh',
      ],
    },
  ];

  const studentWeaknesses = [
    { name: 'Nguyễn Văn An', class: '3A', weakTopics: ['Phép chia có dư', 'Đổi đơn vị'], avgScore: 6.5 },
    { name: 'Trần Thị Bình', class: '3A', weakTopics: ['Bài toán nhiều bước'], avgScore: 7.0 },
    { name: 'Lê Minh Châu', class: '3B', weakTopics: ['Phân số', 'So sánh số'], avgScore: 6.8 },
    { name: 'Phạm Quốc Dũng', class: '3A', weakTopics: ['Phép chia có dư'], avgScore: 7.2 },
    { name: 'Hoàng Thị Em', class: '3B', weakTopics: ['Đổi đơn vị', 'Phân số'], avgScore: 6.3 },
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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Phân tích lỗi & Đề xuất</h1>
            <p className="text-gray-600">Điều chỉnh giảng dạy dựa trên dữ liệu thực tế</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <BarChart3 className="w-8 h-8 text-orange-500 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">4</p>
          <p className="text-sm text-gray-600">Lỗi phổ biến nhất</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Users className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">23</p>
          <p className="text-sm text-gray-600">HS cần hỗ trợ nhiều</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Target className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">68%</p>
          <p className="text-sm text-gray-600">Tỷ lệ lỗi cao nhất</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Lightbulb className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">12</p>
          <p className="text-sm text-gray-600">Gợi ý giảng dạy</p>
        </div>
      </div>

      {/* Common Errors Analysis */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-gray-900 mb-6">Lỗi phổ biến theo chủ đề</h2>
        <div className="space-y-6">
          {commonErrors.map((error, index) => (
            <div key={index} className="border-l-4 border-orange-400 pl-6 py-4 bg-orange-50 rounded-r-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{error.topic}</h3>
                    <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                      {error.category}
                    </span>
                    {error.trend === 'down' && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        ↓ Đang cải thiện
                      </span>
                    )}
                    {error.trend === 'up' && (
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                        ↑ Cần chú ý
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-1 text-orange-500" />
                    Loại lỗi: {error.errorType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{error.students}</p>
                  <p className="text-xs text-gray-600">học sinh</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-400 h-3 rounded-full transition-all"
                      style={{ width: `${error.percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-12">{error.percent}%</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  <p className="text-sm font-semibold text-orange-900">Gợi ý can thiệp:</p>
                </div>
                <ul className="space-y-1">
                  {error.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Tạo bài tập bổ trợ →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Student Weaknesses */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Học sinh cần hỗ trợ cá nhân</h2>
          <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            Xem tất cả →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Học sinh</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Lớp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Điểm TB</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Chủ đề yếu</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {studentWeaknesses.map((student, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{student.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{student.class}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${student.avgScore < 7 ? 'text-red-600' : 'text-orange-600'}`}>
                      {student.avgScore}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {student.weakTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                      Tạo bài riêng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
