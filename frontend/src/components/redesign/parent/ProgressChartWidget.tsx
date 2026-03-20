import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface ProgressDataPoint {
  topic: string;
  score: number;
}

interface ProgressChartWidgetProps {
  data: ProgressDataPoint[];
  title: string;
}

export function ProgressChartWidget({ data, title }: ProgressChartWidgetProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="topic" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip formatter={(value) => [`${value ?? 0}%`, 'Điểm']} />
              <Bar dataKey="score" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
