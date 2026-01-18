import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockErrorStats, mockTopErrors, mockStudentsNeedingSupport } from '@/mockData/mockErrorData';
import { AlertCircle, TrendingUp, TrendingDown, Minus, ArrowRight, UserX, Clock, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ErrorAnalyticsPage() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Phân tích Lỗi sai & Vi phạm</h1>
                    <p className="text-muted-foreground mt-1">Tổng hợp các lỗi phổ biến và học sinh cần hỗ trợ.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Tạo bài tập khắc phục</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Tổng số lỗi"
                    value={mockErrorStats.totalErrors.toLocaleString()}
                    icon={<AlertCircle className="w-5 h-5 text-red-600" />}
                    trend="+5% so với tuần trước"
                    trendType="negative"
                />
                <StatsCard
                    title="Lỗi phổ biến nhất"
                    value={mockErrorStats.mostCommonType}
                    icon={<Calculator className="w-5 h-5 text-orange-600" />}
                    subtext="Chiếm 36% tổng số lỗi"
                />
                <StatsCard
                    title="TG khắc phục TB"
                    value={mockErrorStats.avgCorrectionTime}
                    icon={<Clock className="w-5 h-5 text-blue-600" />}
                    trend="-10% (Cải thiện)"
                    trendType="positive"
                />
                <StatsCard
                    title="Học sinh cần hỗ trợ"
                    value={mockErrorStats.criticalStudents.toString()}
                    icon={<UserX className="w-5 h-5 text-purple-600" />}
                    subtext="Có tỷ lệ sai > 50%"
                    highlight
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Top Errors Trend */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-500" />
                                Xu hướng lỗi sai (Top 5)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {mockTopErrors.map((error) => (
                                <div key={error.id} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-gray-900">{error.name}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-500">{error.count} lỗi ({error.percentage}%)</span>
                                            <TrendBadge type={error.trend} value={error.trendValue} />
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${getProgressColor(error.percentage)}`}
                                            style={{ width: `${error.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Action Callout */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900">Gợi ý từ AI 💡</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                Lớp 3A đang gặp khó khăn lớn với <strong>Phép chia có dư</strong>.
                                Bạn nên tạo một bài tập luyện tập tập trung vào chủ đề này.
                            </p>
                        </div>
                        <Button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            Tạo bài tập ngay <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Right Column: Students Needing Support */}
                <div className="lg:col-span-1">
                    <Card className="shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserX className="w-5 h-5 text-gray-500" />
                                Cần hỗ trợ gấp
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {mockStudentsNeedingSupport.map((student) => (
                                    <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer">
                                        <div>
                                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {student.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Lớp {student.class} • Yếu: {student.topIssue}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={student.status === 'critical' ? 'destructive' : 'secondary'} className={student.status === 'warning' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' : ''}>
                                                Sai {student.errorRate}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 text-center border-t border-gray-100">
                                <Button variant="link" className="text-blue-600 hover:underline">
                                    Xem tất cả danh sách
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Sub-components
function StatsCard({ title, value, icon, trend, trendType, subtext, highlight }: any) {
    return (
        <Card className={`${highlight ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200'} shadow-sm`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className={`p-2 rounded-lg ${highlight ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold tracking-tight text-gray-900">{value}</span>
                    {trend && (
                        <span className={`text-xs font-medium ${trendType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                            {trend}
                        </span>
                    )}
                    {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

function TrendBadge({ type, value }: { type: 'up' | 'down' | 'stable', value: number }) {
    if (type === 'up') {
        return <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded"><TrendingUp className="w-3 h-3 mr-1" /> {value}%</span>;
    }
    if (type === 'down') {
        return <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded"><TrendingDown className="w-3 h-3 mr-1" /> {value}%</span>;
    }
    return <span className="flex items-center text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded"><Minus className="w-3 h-3 mr-1" /></span>;
}

function getProgressColor(percentage: number) {
    if (percentage >= 30) return 'bg-red-500';
    if (percentage >= 15) return 'bg-orange-500';
    return 'bg-blue-500';
}
