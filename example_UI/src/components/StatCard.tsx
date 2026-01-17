import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'teal' | 'purple';
}

export function StatCard({ icon: Icon, value, label, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    teal: 'text-teal-500',
    purple: 'text-purple-500',
  };

  const trendColors = {
    positive: 'text-green-500 bg-green-50',
    negative: 'text-red-500 bg-red-50',
    neutral: 'text-blue-500 bg-blue-50',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${colorClasses[color]}`} />
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive !== undefined
                ? trend.isPositive
                  ? trendColors.positive
                  : trendColors.negative
                : trendColors.neutral
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
