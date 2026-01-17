import { ArrowLeft, Target, Layers, Users, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface DifferentiationScreenProps {
  onBack: () => void;
}

export function DifferentiationScreen({ onBack }: DifferentiationScreenProps) {
  const [visibleLevels, setVisibleLevels] = useState({
    foundation: true,
    standard: true,
    extension: true,
    advanced: true,
  });

  const levels = [
    {
      id: 'foundation',
      name: 'Foundation (Nền tảng)',
      color: 'green',
      students: 8,
      description: 'Củng cố kiến thức cơ bản',
      exercises: [
        '15 : 3 = ?',
        '20 : 4 = ?',
        '18 : 6 = ?',
      ],
    },
    {
      id: 'standard',
      name: 'Standard (Chuẩn)',
      color: 'blue',
      students: 18,
      description: 'Phù hợp đa số học sinh',
      exercises: [
        '23 : 5 = ? (dư ...)',
        '31 : 7 = ? (dư ...)',
        '45 : 8 = ? (dư ...)',
      ],
    },
    {
      id: 'extension',
      name: 'Extension (Mở rộng)',
      color: 'orange',
      students: 9,
      description: 'Thử thách tư duy',
      exercises: [
        'Tìm số bị chia, biết số chia là 6, thương là 7 và số dư là 3',
        'Một số chia cho 8 được thương là 5 dư 4. Tìm số đó.',
      ],
    },
    {
      id: 'advanced',
      name: 'Advanced (Nâng cao)',
      color: 'purple',
      students: 5,
      description: 'Bài toán tổng hợp',
      exercises: [
        'Có 87 quyển vở chia đều cho một số học sinh, mỗi em được 9 quyển và còn thừa 6 quyển. Hỏi có bao nhiêu học sinh?',
        'Số học sinh của một lớp khi xếp thành hàng 6 thì thừa 2 em, xếp thành hàng 8 thì thừa 4 em. Biết số học sinh từ 30 đến 40 em. Tìm số học sinh.',
      ],
    },
  ];

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700',
      badge: 'bg-green-500',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-700',
      badge: 'bg-blue-500',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-700',
      badge: 'bg-orange-500',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-700',
      badge: 'bg-purple-500',
    },
  };

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
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Phân hóa đa cấp độ</h1>
            <p className="text-gray-600">Một mục tiêu → 4 cấp độ khó</p>
          </div>
        </div>
      </div>

      {/* Lesson Objective */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-teal-500" />
          <h2 className="text-gray-900">Mục tiêu bài học</h2>
        </div>
        <p className="text-gray-700 bg-teal-50 p-4 rounded-xl border border-teal-100">
          Học sinh hiểu và thực hiện được phép chia có dư trong phạm vi 100
        </p>
      </div>

      {/* Level Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Quản lý hiển thị cấp độ</h3>
          <div className="text-sm text-gray-600">Tổng: {levels.reduce((sum, l) => sum + l.students, 0)} học sinh</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() =>
                setVisibleLevels((prev) => ({ ...prev, [level.id]: !prev[level.id as keyof typeof prev] }))
              }
              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                visibleLevels[level.id as keyof typeof visibleLevels]
                  ? `${colorClasses[level.color as keyof typeof colorClasses].border} ${colorClasses[level.color as keyof typeof colorClasses].bg}`
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                {visibleLevels[level.id as keyof typeof visibleLevels] ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{level.name.split(' ')[0]}</span>
              </div>
              <span className="text-xs font-semibold">{level.students}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Differentiated Levels */}
      <div className="space-y-6">
        {levels.map((level) => {
          const colors = colorClasses[level.color as keyof typeof colorClasses];
          return visibleLevels[level.id as keyof typeof visibleLevels] ? (
            <div
              key={level.id}
              className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${colors.badge} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold`}>
                    {level.id === 'foundation' ? '1' : level.id === 'standard' ? '2' : level.id === 'extension' ? '3' : '4'}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${colors.text}`}>{level.name}</h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">{level.students} HS</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 space-y-3">
                {level.exercises.map((exercise, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`${colors.badge} w-6 h-6 rounded flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                      {idx + 1}
                    </div>
                    <p className="text-gray-800">{exercise}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                  Chỉnh sửa bài tập
                </button>
                <button className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                  Gắn nhãn học sinh
                </button>
              </div>
            </div>
          ) : null;
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all">
          Tạo thêm cấp độ
        </button>
        <button className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all">
          Lưu & Xuất PDF
        </button>
      </div>
    </div>
  );
}
