import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    BarChart,
    Bar,
    ResponsiveContainer,
} from 'recharts';
import type { StudentSpotlightData } from '@/types/chat';

interface StudentSpotlightChartsProps {
    data: StudentSpotlightData;
}

const TIER_COLORS: Record<string, string> = {
    foundation: 'bg-orange-100 text-orange-700',
    standard: 'bg-blue-100 text-blue-700',
    extension: 'bg-green-100 text-green-700',
    advanced: 'bg-purple-100 text-purple-700',
};

function SpotlightSummaryCard({ data }: { data: StudentSpotlightData }) {
    const tierClass = TIER_COLORS[data.tier?.toLowerCase() || ''] || 'bg-gray-100 text-gray-700';
    const aboveAvg = data.average_score >= data.class_average_score;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800">{data.student_name}</span>
                    {data.tier && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tierClass}`}>
                            {data.tier}
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-500">{data.total_worksheets} bài</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold ${aboveAvg ? 'text-green-600' : 'text-red-500'}`}>
                    {data.average_score}
                </span>
                <span className="text-xs text-gray-400">/10</span>
                <span className="text-xs text-gray-400 ml-2">
                    (Lớp: {data.class_average_score}/10)
                </span>
                <span className={`text-xs ml-1 ${aboveAvg ? 'text-green-600' : 'text-red-500'}`}>
                    {aboveAvg ? '▲' : '▼'}
                </span>
            </div>
        </div>
    );
}

function ScoreTrendChart({ data }: { data: StudentSpotlightData }) {
    if (!data.score_trend?.length) return null;

    const chartData = data.score_trend.map((t) => ({
        date: t.date?.slice(5, 10) || '',
        pct: t.max_score > 0 ? Math.round((t.score / t.max_score) * 100) : 0,
    }));

    const classAvgPct =
        data.class_average_score > 0 ? Math.round(data.class_average_score * 10) : 0;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">📈 Xu hướng điểm (%)</h4>
            <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={30} />
                    <Tooltip
                        formatter={(v) => [`${v}%`, 'Điểm']}
                        contentStyle={{ fontSize: 12 }}
                    />
                    <ReferenceLine
                        y={classAvgPct}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        label={{ value: 'TB lớp', fontSize: 10, fill: '#ef4444' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="pct"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#3b82f6' }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function ErrorDistributionChart({ data }: { data: StudentSpotlightData }) {
    if (!data.error_distribution?.length) return null;

    const chartData = data.error_distribution.slice(0, 6).map((e) => ({
        name: e.error_type.length > 12 ? e.error_type.slice(0, 12) + '…' : e.error_type,
        count: e.count,
    }));

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">📊 Phân bố lỗi</h4>
            <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        width={80}
                    />
                    <Tooltip
                        formatter={(v) => [`${v} lần`, 'Số lỗi']}
                        contentStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function StudentSpotlightCharts({ data }: StudentSpotlightChartsProps) {
    return (
        <div className="space-y-2 my-2">
            <SpotlightSummaryCard data={data} />
            <ScoreTrendChart data={data} />
            <ErrorDistributionChart data={data} />
        </div>
    );
}
