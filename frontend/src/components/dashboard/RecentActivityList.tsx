import { useState, useEffect, useCallback } from 'react';

interface Activity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    icon: string;
    color: string;
    metadata?: {
        class_name?: string;
    };
}

const COLOR_MAP: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
};

function formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

export function RecentActivityList() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/activities', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            } else {
                setError('Không thể tải hoạt động');
            }
        } catch {
            setError('Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4 text-gray-500">
                <p className="text-sm">{error}</p>
                <button
                    onClick={fetchActivities}
                    className="text-xs text-blue-600 hover:underline mt-2"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Chưa có hoạt động nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${COLOR_MAP[activity.color] || 'bg-gray-100 text-gray-600'}`}>
                        {activity.icon}
                    </div>
                    <div className="pt-1">
                        <p className="text-gray-900 font-medium text-sm leading-snug">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                </div>
            ))}
            <button className="w-full py-2 text-sm text-center text-gray-500 hover:text-gray-900 border-t border-gray-100 mt-2">
                Xem tất cả hoạt động
            </button>
        </div>
    );
}
