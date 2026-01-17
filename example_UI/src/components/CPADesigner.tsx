import { useState } from 'react';
import { ArrowLeft, Sparkles, BookOpen, Image, Calculator, ChevronRight, Check, Edit3 } from 'lucide-react';

interface CPADesignerProps {
  onBack: () => void;
}

export function CPADesigner({ onBack }: CPADesignerProps) {
  const [step, setStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [selectedTopic, setSelectedTopic] = useState('division');

  const grades = ['1', '2', '3', '4', '5'];
  const topics = [
    { id: 'division', name: 'Phép chia có dư' },
    { id: 'multiplication', name: 'Phép nhân trong phạm vi 1000' },
    { id: 'fractions', name: 'Phân số đơn giản' },
    { id: 'geometry', name: 'Hình học cơ bản' },
  ];

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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Tạo học liệu CPA</h1>
            <p className="text-gray-600">Concrete - Pictorial - Abstract</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Chọn khối & chủ đề' },
            { num: 2, label: 'Xác định mục tiêu' },
            { num: 3, label: 'Xem trước & chỉnh sửa' },
          ].map((s, index) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s.num
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">{s.label}</p>
              </div>
              {index < 2 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    step > s.num ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-gray-900 mb-6">Bước 1: Chọn khối lớp và chủ đề</h2>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Khối lớp</label>
            <div className="flex gap-3">
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedGrade === grade
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lớp {grade}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chủ đề toán (Theo chương trình GDPT 2018)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTopic === topic.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{topic.name}</span>
                    {selectedTopic === topic.id && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full md:w-auto px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            Tiếp theo
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-gray-900 mb-6">Bước 2: Xác định mục tiêu bài học</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mục tiêu bài học
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Ví dụ: Học sinh hiểu và thực hiện được phép chia có dư trong phạm vi 100"
              defaultValue="Học sinh hiểu và thực hiện được phép chia có dư trong phạm vi 100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Số lượng bài tập mỗi cấp độ
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['Concrete', 'Pictorial', 'Abstract'].map((level) => (
                <div key={level}>
                  <label className="block text-xs text-gray-600 mb-2">{level}</label>
                  <input
                    type="number"
                    defaultValue="5"
                    min="3"
                    max="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Quay lại
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Tạo bài tập bằng AI
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Bước 3: Xem trước & chỉnh sửa</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Lưu học liệu
                </button>
              </div>
            </div>

            {/* CPA Preview */}
            <div className="space-y-6">
              {/* Concrete */}
              <div className="border-2 border-orange-300 rounded-xl p-6 bg-orange-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Concrete (Cụ thể)</h3>
                    <p className="text-sm text-gray-600">Gắn với thực tế đời sống</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-800 mb-3">
                    <strong>Bài 1:</strong> Cô giáo có 23 cái kẹo muốn chia đều cho 5 bạn học sinh. 
                    Hỏi mỗi bạn được bao nhiêu cái kẹo và còn thừa bao nhiêu cái?
                  </p>
                  <div className="flex gap-2 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-orange-100 rounded-full">Thực tế</span>
                    <span className="px-3 py-1 bg-orange-100 rounded-full">Chia đều</span>
                  </div>
                </div>
              </div>

              {/* Pictorial */}
              <div className="border-2 border-teal-300 rounded-xl p-6 bg-teal-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pictorial (Hình ảnh)</h3>
                    <p className="text-sm text-gray-600">Minh họa bằng hình vẽ</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-800 mb-3">
                    <strong>Bài 2:</strong> Quan sát hình vẽ dưới đây. Có 17 quả táo được xếp vào các rổ, mỗi rổ 4 quả.
                  </p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[1, 2, 3, 4].map((basket) => (
                      <div key={basket} className="border-2 border-teal-300 rounded-lg p-2 bg-teal-50 text-center">
                        <div className="text-2xl mb-1">🧺</div>
                        <div className="text-sm">4 quả</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">+ 1 quả còn thừa 🍎</p>
                </div>
              </div>

              {/* Abstract */}
              <div className="border-2 border-blue-300 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Abstract (Trừu tượng)</h3>
                    <p className="text-sm text-gray-600">Ký hiệu toán học</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-800 mb-3">
                    <strong>Bài 3:</strong> Thực hiện phép chia:
                  </p>
                  <div className="space-y-2 font-mono text-lg">
                    <div>a) 27 : 6 = ...</div>
                    <div>b) 35 : 8 = ...</div>
                    <div>c) 42 : 9 = ...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Quay lại
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
            >
              Hoàn thành & lưu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
