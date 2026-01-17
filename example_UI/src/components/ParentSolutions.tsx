import { ArrowLeft, BookOpen, Lightbulb, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface ParentSolutionsProps {
  onBack: () => void;
}

export function ParentSolutions({ onBack }: ParentSolutionsProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">Hướng dẫn giải bài cho phụ huynh</h1>
            <p className="text-gray-600">Giải thích đơn giản theo phương pháp dạy mới</p>
          </div>
        </div>
      </div>

      {/* Pedagogy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">Cách giải đúng phương pháp mới</p>
          <p className="text-sm text-blue-700">
            Hướng dẫn dưới đây phù hợp với chương trình GDPT 2018. Không sử dụng ẩn số (x) 
            hay phương pháp cũ để tránh gây nhầm lẫn cho con.
          </p>
        </div>
      </div>

      {/* Exercise with Solution */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
        {/* Problem */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              ?
            </div>
            <h2 className="font-semibold text-gray-900">Đề bài</h2>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
            <p className="text-gray-800 leading-relaxed">
              Cô giáo có 28 cái kẹo muốn chia đều cho 6 bạn học sinh. 
              Hỏi mỗi bạn được bao nhiêu cái kẹo và còn thừa bao nhiêu cái?
            </p>
          </div>
        </div>

        {/* Step-by-step Solution */}
        <div className="space-y-6">
          <div className="flex items-start gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <h3 className="font-semibold text-gray-900">Cách hướng dẫn con từng bước:</h3>
          </div>

          {/* Step 1 - Concrete */}
          <div className="pl-8 border-l-4 border-green-500 bg-green-50 rounded-r-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <h4 className="font-semibold text-green-900">Bước 1: Hiểu đề bài (Concrete)</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Hỏi con:</strong> "Con hãy đọc đề và cho mẹ/ba biết bài toán nói về gì?"
            </p>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Hướng dẫn:</strong> "Có 28 cái kẹo, cô chia cho 6 bạn. Mỗi bạn được số kẹo bằng nhau."
            </p>
            <p className="text-sm text-gray-700">
              💡 <strong>Mẹo:</strong> Có thể dùng 28 viên bi/đồ vật nhỏ và 6 cái cốc để con thực hành chia trực tiếp.
            </p>
          </div>

          {/* Step 2 - Pictorial */}
          <div className="pl-8 border-l-4 border-teal-500 bg-teal-50 rounded-r-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <h4 className="font-semibold text-teal-900">Bước 2: Vẽ sơ đồ (Pictorial)</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Hướng dẫn con vẽ:</strong>
            </p>
            <div className="bg-white rounded-lg p-4 border border-teal-200 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                <p className="text-sm font-medium text-gray-800">Minh họa:</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">• Vẽ 6 hộp (đại diện cho 6 bạn)</p>
                <p className="text-sm text-gray-700">• Cho từng cái kẹo vào hộp, mỗi hộp 1 cái</p>
                <p className="text-sm text-gray-700">• Lặp lại cho đến hết kẹo</p>
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((box) => (
                  <div key={box} className="border-2 border-teal-300 rounded-lg p-2 bg-white text-center">
                    <div className="text-xs text-gray-600 mb-1">Bạn {box}</div>
                    <div className="text-lg">🍬🍬🍬🍬</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">Còn thừa: 🍬🍬🍬🍬</p>
            </div>
            <p className="text-sm text-gray-700">
              📝 <strong>Kết luận:</strong> Mỗi hộp có 4 cái kẹo, còn thừa 4 cái.
            </p>
          </div>

          {/* Step 3 - Abstract */}
          <div className="pl-8 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <h4 className="font-semibold text-blue-900">Bước 3: Viết phép tính (Abstract)</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Giải thích:</strong> "Bây giờ chúng ta viết thành phép tính toán học"
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-gray-800 mb-2">
                <strong>Phép chia:</strong> 28 : 6 = ?
              </p>
              <p className="text-gray-800 mb-2">
                <strong>Bài giải:</strong>
              </p>
              <div className="pl-4 space-y-1 font-mono">
                <p>28 : 6 = 4 (dư 4)</p>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-100">
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Giải thích cho con:</strong>
                </p>
                <p className="text-sm text-gray-600">
                  • 6 × 4 = 24 (chia được 24 cái cho 6 bạn, mỗi bạn 4 cái)
                </p>
                <p className="text-sm text-gray-600">
                  • 28 - 24 = 4 (còn thừa 4 cái)
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 - Answer */}
          <div className="pl-8 border-l-4 border-purple-500 bg-purple-50 rounded-r-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                4
              </div>
              <h4 className="font-semibold text-purple-900">Bước 4: Trả lời</h4>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-gray-800 mb-2">
                <strong>Câu trả lời đầy đủ:</strong>
              </p>
              <p className="text-gray-700 italic">
                "Mỗi bạn được 4 cái kẹo và còn thừa 4 cái kẹo."
              </p>
            </div>
            <p className="text-sm text-gray-700 mt-3">
              ✅ <strong>Nhắc con:</strong> Luôn viết câu trả lời có đơn vị (cái kẹo, bạn học sinh...)
            </p>
          </div>
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">⚠️ Những lỗi thường gặp</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
              ✗
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-1">Số dư lớn hơn hoặc bằng số chia</p>
              <p className="text-sm text-red-700">
                Ví dụ: 28 : 6 = 3 (dư 10) → <strong>SAI!</strong> Vì dư 10 {'>'} 6
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
              ✗
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-1">Quên viết "dư"</p>
              <p className="text-sm text-red-700">
                Ví dụ: 28 : 6 = 4... 4 → <strong>SAI!</strong> Phải viết: 28 : 6 = 4 (dư 4)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips for Parents */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-3">Mẹo đồng hành hiệu quả</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Luôn khuyến khích con tự làm trước, sau đó mới hỗ trợ</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Sử dụng đồ vật thực tế để minh họa (kẹo, viên bi, bút...)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Kiên nhẫn lắng nghe cách con giải, đừng vội chỉ ra lỗi sai</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Khen ngợi khi con làm đúng hoặc cố gắng suy nghĩ</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
