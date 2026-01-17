interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'orange' | 'teal' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 w-12 text-right">{percentage}%</span>
      )}
    </div>
  );
}
