import { Badge } from '@/components/ui/badge';
import type { ProgressStatus } from '@/types/studentPortfolio';

const STATUS_STYLES: Record<ProgressStatus, string> = {
    no_data: 'bg-slate-100 text-slate-700 border-slate-200',
    improving: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    stable: 'bg-blue-100 text-blue-700 border-blue-200',
    needs_monitoring: 'bg-amber-100 text-amber-700 border-amber-200',
    at_risk: 'bg-red-100 text-red-700 border-red-200',
};

interface ProgressStatusBadgeProps {
    status: ProgressStatus;
    label: string;
}

export function ProgressStatusBadge({ status, label }: ProgressStatusBadgeProps) {
    return <Badge className={STATUS_STYLES[status]}>{label}</Badge>;
}
