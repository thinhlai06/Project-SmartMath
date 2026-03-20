import { Badge } from '@/components/ui/badge';

interface QuickActionCardProps {
    title: string;
    icon: string;
    color: 'blue' | 'purple' | 'orange' | 'teal' | 'red';
    onClick: () => void;
    badge?: string;
}

export function QuickActionCard({ title, icon, color, onClick, badge }: QuickActionCardProps) {
    const colorMap = {
        blue: { bg: 'bg-blue-50/50', hover: 'hover:bg-blue-50 hover:border-blue-200', iconBg: 'bg-blue-100 text-blue-600', badge: 'bg-blue-100 text-blue-700' },
        purple: { bg: 'bg-indigo-50/50', hover: 'hover:bg-indigo-50 hover:border-indigo-200', iconBg: 'bg-indigo-100 text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
        orange: { bg: 'bg-orange-50/50', hover: 'hover:bg-orange-50 hover:border-orange-200', iconBg: 'bg-orange-100 text-orange-600', badge: 'bg-orange-100 text-orange-700' },
        teal: { bg: 'bg-emerald-50/50', hover: 'hover:bg-emerald-50 hover:border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
        red: { bg: 'bg-rose-50/50', hover: 'hover:bg-rose-50 hover:border-rose-200', iconBg: 'bg-rose-100 text-rose-600', badge: 'bg-rose-100 text-rose-700' },
    };

    const styles = colorMap[color];

    return (
        <button
            onClick={onClick}
            className={`btn-bounce flex flex-col items-center gap-3 p-5 ${styles.bg} border-2 border-transparent ${styles.hover} rounded-3xl transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-soft bg-white/50 backdrop-blur-sm`}
        >
            <div className={`w-14 h-14 ${styles.iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                <span className="text-2xl drop-shadow-sm">{icon}</span>
            </div>
            <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{title}</span>
            {badge && (
                <Badge variant="secondary" className={`scale-90 absolute top-3 right-3 rounded-full font-bold px-2 py-0.5 shadow-sm ${styles.badge}`}>
                    {badge}
                </Badge>
            )}
        </button>
    );
}
