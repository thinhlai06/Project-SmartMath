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
        blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', iconBg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
        purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', iconBg: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
        orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', iconBg: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
        teal: { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', iconBg: 'bg-teal-500', badge: 'bg-teal-100 text-teal-700' },
        red: { bg: 'bg-red-50', hover: 'hover:bg-red-100', iconBg: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
    };

    const styles = colorMap[color];

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 ${styles.bg} ${styles.hover} rounded-xl transition-colors group relative`}
        >
            <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <span className="font-medium text-gray-700">{title}</span>
            {badge && (
                <Badge variant="secondary" className={`scale-75 absolute top-2 right-2 ${styles.badge}`}>
                    {badge}
                </Badge>
            )}
        </button>
    );
}
