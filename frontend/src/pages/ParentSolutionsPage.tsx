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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans py-8">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[100px] -z-0 pointer-events-none" />
            
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="mb-6 flex items-center gap-3">
                    <Link to="/parent" className="inline-flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-white hover:text-indigo-600 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang phụ huynh
                    </Link>
                </div>

                {/* Pedagogy Notice */}
                <div className="glass-panel bg-amber-50/80 border-amber-200 rounded-3xl p-5 mb-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-800 text-lg">💡 Cách giải đúng phương pháp mới</h3>
                            <p className="text-sm font-medium text-amber-700 mt-1">
                                Phù hợp với chương trình GDPT 2018. <strong>Không sử dụng ẩn số (x)</strong> hay phương pháp cũ để tránh nhầm lẫn cho con.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Question */}
                <div className="glass-panel border-white/50 rounded-3xl p-8 shadow-soft mb-8">
                    <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                        <span className="text-2xl drop-shadow-sm">❓</span> ĐỀ BÀI
                    </h2>
                    <div className="bg-white/60 rounded-2xl p-5 border-l-4 border-indigo-500 shadow-inner">
                        <p className="text-slate-800 font-medium text-lg leading-relaxed">{MOCK_SOLUTION.question}</p>
                    </div>
                </div>

                {/* 4 CPA Steps */}
                <div className="glass-panel border-white/50 rounded-3xl p-8 shadow-soft mb-8">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                        <span className="text-2xl drop-shadow-sm">✓</span> CÁCH HƯỚNG DẪN CON TỪNG BƯỚC
                    </h2>

                    <div className="space-y-6">
                        {/* Step 1: Concrete */}
                        <div className="border-l-4 border-orange-400 bg-orange-50/80 rounded-r-2xl p-6 shadow-sm">
                            <h3 className="font-extrabold text-orange-700 flex items-center gap-2 text-lg">
                                <span className="text-2xl drop-shadow-sm">🌱</span> BƯỚC 1: {MOCK_SOLUTION.steps.concrete.title}
                            </h3>
                            <div className="mt-4 space-y-3 text-base">
                                <p className="text-slate-700 font-medium">
                                    <strong className="text-slate-900">Hỏi con:</strong> "{MOCK_SOLUTION.steps.concrete.askChild}"
                                </p>
                                <p className="text-slate-700 font-medium">
                                    <strong className="text-slate-900">Hướng dẫn:</strong> "{MOCK_SOLUTION.steps.concrete.guide}"
                                </p>
                                <div className="bg-orange-100/80 rounded-xl p-3 mt-3 border border-orange-200/50">
                                    <p className="text-orange-800 font-medium">
                                        💡 <strong>Mẹo:</strong> {MOCK_SOLUTION.steps.concrete.tip}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Pictorial */}
                        <div className="border-l-4 border-indigo-400 bg-indigo-50/80 rounded-r-2xl p-6 shadow-sm">
                            <h3 className="font-extrabold text-indigo-700 flex items-center gap-2 text-lg">
                                <span className="text-2xl drop-shadow-sm">🎨</span> BƯỚC 2: {MOCK_SOLUTION.steps.pictorial.title}
                            </h3>
                            <div className="mt-4 space-y-3 text-base">
                                <p className="text-slate-700 font-medium">
                                    <strong className="text-slate-900">Hướng dẫn:</strong> {MOCK_SOLUTION.steps.pictorial.guide}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white/60 rounded-xl shadow-inner border border-indigo-100">
                                    {MOCK_SOLUTION.steps.pictorial.illustration.map((box, i) => (
                                        <span key={i} className="text-2xl">{box}</span>
                                    ))}
                                </div>
                                <p className="text-slate-700 font-medium pt-2">
                                    <strong className="text-slate-900">Còn thừa:</strong> {MOCK_SOLUTION.steps.pictorial.remainder}
                                </p>
                                <div className="bg-indigo-100/80 rounded-xl p-3 mt-3 border border-indigo-200/50">
                                    <p className="text-indigo-800 font-medium">
                                        📝 <strong>Kết luận:</strong> {MOCK_SOLUTION.steps.pictorial.conclusion}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Abstract */}
                        <div className="border-l-4 border-purple-400 bg-purple-50/80 rounded-r-2xl p-6 shadow-sm">
                            <h3 className="font-extrabold text-purple-700 flex items-center gap-2 text-lg">
                                <span className="text-2xl drop-shadow-sm">🔢</span> BƯỚC 3: {MOCK_SOLUTION.steps.abstract.title}
                            </h3>
                            <div className="mt-4 space-y-3 text-base">
                                <p className="text-slate-700 font-medium">
                                    <strong className="text-slate-900">Phép chia:</strong> <span className="font-mono bg-white/60 px-2 py-1 rounded-md shadow-sm border border-purple-100">{MOCK_SOLUTION.steps.abstract.operation}</span>
                                </p>
                                <p className="text-slate-700 font-medium">
                                    <strong className="text-slate-900">Bài giải:</strong> <span className="font-mono text-xl font-bold bg-white/60 px-3 py-1.5 rounded-md shadow-sm border border-purple-100 ml-2 text-purple-700">{MOCK_SOLUTION.steps.abstract.solution}</span>
                                </p>
                                <p className="text-slate-600 font-medium pt-1">
                                    <strong className="text-slate-900">Giải thích:</strong> {MOCK_SOLUTION.steps.abstract.explanation}
                                </p>
                            </div>
                        </div>

                        {/* Step 4: Answer */}
                        <div className="border-l-4 border-emerald-400 bg-emerald-50/80 rounded-r-2xl p-6 shadow-sm">
                            <h3 className="font-extrabold text-emerald-700 flex items-center gap-2 text-lg">
                                <span className="text-2xl drop-shadow-sm">✅</span> BƯỚC 4: {MOCK_SOLUTION.steps.answer.title}
                            </h3>
                            <div className="mt-4 text-base">
                                <p className="text-slate-900 font-bold text-xl mb-4">
                                    "{MOCK_SOLUTION.steps.answer.response}"
                                </p>
                                <div className="bg-emerald-100/80 rounded-xl p-3 border border-emerald-200/50">
                                    <p className="text-emerald-800 font-semibold flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                                        {MOCK_SOLUTION.steps.answer.reminder}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extras Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Common Mistakes */}
                    <div className="glass-panel bg-red-50/80 border-red-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-lg">
                            <AlertTriangle className="w-6 h-6" />
                            ⚠️ NHỮNG LỖI THƯỜNG GẶP
                        </h2>
                        <ul className="space-y-3">
                            {MOCK_SOLUTION.commonMistakes.map((mistake, i) => (
                                <li key={i} className="flex items-start gap-3 text-base text-red-700 font-medium bg-white/40 p-3 rounded-xl border border-red-100/50">
                                    <span className="text-red-500 font-bold mt-0.5 w-5 flex-shrink-0 text-center">✗</span>
                                    <span>{mistake}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tips */}
                    <div className="glass-panel bg-purple-50/80 border-purple-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="font-bold text-purple-800 mb-4 flex items-center gap-2 text-lg">
                            <Heart className="w-6 h-6 text-pink-500 fill-pink-500/20" />
                            💡 MẸO ĐỒNG HÀNH HIỆU QUẢ
                        </h2>
                        <ul className="space-y-3">
                            {MOCK_SOLUTION.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-base text-purple-700 font-medium bg-white/40 p-3 rounded-xl border border-purple-100/50">
                                    <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mt-0.5 flex-shrink-0">✓</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
