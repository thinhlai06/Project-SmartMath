import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lightbulb, AlertTriangle, Heart } from 'lucide-react';

// Mock solution data
const MOCK_SOLUTION = {
    question: 'Cô giáo có 28 cái kẹo muốn chia đều cho 6 bạn học sinh. Hỏi mỗi bạn được bao nhiêu cái kẹo và còn thừa bao nhiêu cái?',
    steps: {
        concrete: {
            title: 'Hiểu đề bài (Concrete)',
            askChild: 'Con hãy đọc đề và cho mẹ/ba biết: Có bao nhiêu cái kẹo? Chia cho mấy bạn?',
            guide: 'Có 28 cái kẹo, cô chia cho 6 bạn. Con cần tìm: Mỗi bạn được mấy cái? Còn thừa mấy cái?',
            tip: 'Dùng 28 viên bi (hoặc đồ vật thực) và 6 cái cốc để thực hành chia.'
        },
        pictorial: {
            title: 'Vẽ sơ đồ (Pictorial)',
            guide: 'Hướng dẫn con vẽ 6 hộp (đại diện cho 6 bạn)',
            illustration: ['🧺🍬🍬🍬🍬', '🧺🍬🍬🍬🍬', '🧺🍬🍬🍬🍬', '🧺🍬🍬🍬🍬', '🧺🍬🍬🍬🍬', '🧺🍬🍬🍬🍬'],
            remainder: '🍬🍬🍬🍬',
            conclusion: 'Mỗi hộp có 4 cái kẹo, còn thừa 4 cái'
        },
        abstract: {
            title: 'Viết phép tính (Abstract)',
            operation: '28 : 6 = ?',
            solution: '28 : 6 = 4 (dư 4)',
            explanation: '6 × 4 = 24, và 28 - 24 = 4 (số dư)'
        },
        answer: {
            title: 'Trả lời',
            response: 'Mỗi bạn được 4 cái kẹo và còn thừa 4 cái kẹo.',
            reminder: 'Nhắc con: Luôn viết câu trả lời có đơn vị (cái kẹo)'
        }
    },
    commonMistakes: [
        'Số dư lớn hơn hoặc bằng số chia (28:6=3 dư 10) → SAI!',
        'Quên viết "dư" (28:6=4...4) → SAI!',
        'Không có đơn vị trong câu trả lời'
    ],
    tips: [
        'Luôn khuyến khích con tự làm trước',
        'Sử dụng đồ vật thực tế để minh họa',
        'Kiên nhẫn lắng nghe cách con giải',
        'Khen ngợi khi con làm đúng hoặc cố gắng'
    ]
};

export default function ParentSolutionsPage() {
    // worksheetId could be used later to load specific worksheet solution
    // worksheetId could be used later to load specific worksheet solution
    useParams<{ worksheetId: string }>();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="mb-4 flex items-center gap-3">
                    <Link to="/parent" className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang phụ huynh
                    </Link>
                </div>

                {/* Pedagogy Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-yellow-800">💡 Cách giải đúng phương pháp mới</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Phù hợp với chương trình GDPT 2018. <strong>Không sử dụng ẩn số (x)</strong> hay phương pháp cũ để tránh nhầm lẫn cho con.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h2 className="font-semibold text-gray-900 mb-3">❓ ĐỀ BÀI</h2>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <p className="text-gray-800">{MOCK_SOLUTION.question}</p>
                    </div>
                </div>

                {/* 4 CPA Steps */}
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">✓ CÁCH HƯỚNG DẪN CON TỪNG BƯỚC</h2>

                    <div className="space-y-4">
                        {/* Step 1: Concrete */}
                        <div className="border-l-4 border-orange-400 bg-orange-50 rounded-r-xl p-4">
                            <h3 className="font-bold text-orange-700 flex items-center gap-2">
                                🌱 BƯỚC 1: {MOCK_SOLUTION.steps.concrete.title}
                            </h3>
                            <div className="mt-3 space-y-2 text-sm">
                                <p className="text-gray-700">
                                    <strong>Hỏi con:</strong> "{MOCK_SOLUTION.steps.concrete.askChild}"
                                </p>
                                <p className="text-gray-700">
                                    <strong>Hướng dẫn:</strong> "{MOCK_SOLUTION.steps.concrete.guide}"
                                </p>
                                <div className="bg-orange-100 rounded-lg p-2 mt-2">
                                    <p className="text-orange-700">
                                        💡 <strong>Mẹo:</strong> {MOCK_SOLUTION.steps.concrete.tip}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Pictorial */}
                        <div className="border-l-4 border-blue-400 bg-blue-50 rounded-r-xl p-4">
                            <h3 className="font-bold text-blue-700 flex items-center gap-2">
                                🎨 BƯỚC 2: {MOCK_SOLUTION.steps.pictorial.title}
                            </h3>
                            <div className="mt-3 space-y-2 text-sm">
                                <p className="text-gray-700">
                                    <strong>Hướng dẫn:</strong> {MOCK_SOLUTION.steps.pictorial.guide}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {MOCK_SOLUTION.steps.pictorial.illustration.map((box, i) => (
                                        <span key={i} className="text-lg">{box}</span>
                                    ))}
                                </div>
                                <p className="text-gray-700">
                                    <strong>Còn thừa:</strong> {MOCK_SOLUTION.steps.pictorial.remainder}
                                </p>
                                <div className="bg-blue-100 rounded-lg p-2 mt-2">
                                    <p className="text-blue-700">
                                        📝 <strong>Kết luận:</strong> {MOCK_SOLUTION.steps.pictorial.conclusion}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Abstract */}
                        <div className="border-l-4 border-purple-400 bg-purple-50 rounded-r-xl p-4">
                            <h3 className="font-bold text-purple-700 flex items-center gap-2">
                                🔢 BƯỚC 3: {MOCK_SOLUTION.steps.abstract.title}
                            </h3>
                            <div className="mt-3 space-y-2 text-sm">
                                <p className="text-gray-700">
                                    <strong>Phép chia:</strong> <span className="font-mono">{MOCK_SOLUTION.steps.abstract.operation}</span>
                                </p>
                                <p className="text-gray-700">
                                    <strong>Bài giải:</strong> <span className="font-mono text-lg">{MOCK_SOLUTION.steps.abstract.solution}</span>
                                </p>
                                <p className="text-gray-600">
                                    <strong>Giải thích:</strong> {MOCK_SOLUTION.steps.abstract.explanation}
                                </p>
                            </div>
                        </div>

                        {/* Step 4: Answer */}
                        <div className="border-l-4 border-green-400 bg-green-50 rounded-r-xl p-4">
                            <h3 className="font-bold text-green-700 flex items-center gap-2">
                                ✅ BƯỚC 4: {MOCK_SOLUTION.steps.answer.title}
                            </h3>
                            <div className="mt-3 text-sm">
                                <p className="text-gray-800 font-medium text-lg">
                                    "{MOCK_SOLUTION.steps.answer.response}"
                                </p>
                                <div className="bg-green-100 rounded-lg p-2 mt-2">
                                    <p className="text-green-700">
                                        ✓ {MOCK_SOLUTION.steps.answer.reminder}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Common Mistakes */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-200 mb-6">
                    <h2 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        ⚠️ NHỮNG LỖI THƯỜNG GẶP
                    </h2>
                    <ul className="space-y-2">
                        {MOCK_SOLUTION.commonMistakes.map((mistake, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                <span className="text-red-500">✗</span>
                                {mistake}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tips */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h2 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        💡 MẸO ĐỒNG HÀNH HIỆU QUẢ
                    </h2>
                    <ul className="space-y-2">
                        {MOCK_SOLUTION.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-purple-700">
                                <span className="text-purple-500">✓</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
