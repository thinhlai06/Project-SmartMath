import { Badge } from '@/components/ui/badge';

interface DiffLevelBadgeProps {
  level: 1 | 2 | 3;
}

const levelConfig = {
  1: {
    label: 'Mức 1 - Dễ',
    className: 'bg-emerald-100 text-emerald-700',
  },
  2: {
    label: 'Mức 2 - Vừa',
    className: 'bg-amber-100 text-amber-700',
  },
  3: {
    label: 'Mức 3 - Khó',
    className: 'bg-rose-100 text-rose-700',
  },
} as const;

export function DiffLevelBadge({ level }: DiffLevelBadgeProps) {
  const config = levelConfig[level];
  return <Badge className={config.className}>{config.label}</Badge>;
}
