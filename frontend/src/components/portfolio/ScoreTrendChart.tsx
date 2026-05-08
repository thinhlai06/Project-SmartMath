import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { ScoreTrendPoint } from '@/types/studentPortfolio';

interface ScoreTrendChartProps {
    points: ScoreTrendPoint[];
}

export function ScoreTrendChart({ points }: ScoreTrendChartProps) {
    if (!points.length) {
        return <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">Chưa có dữ liệu điểm để vẽ xu hướng.</div>;
    }

    const chartData = points.map((point) => ({
        date: point.date ? point.date.slice(5, 10) : '',
        score: point.score,
        title: point.worksheet_title,
    }));

    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value}/10`, 'Điểm']} labelFormatter={(_, items) => items?.[0]?.payload?.title || ''} />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}
