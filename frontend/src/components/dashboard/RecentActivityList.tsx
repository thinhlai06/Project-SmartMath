import { mockRecentActivities } from '@/mockData/mockRecentActivities';

export function RecentActivityList() {
    return (
        <div className="space-y-4">
            {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                        {activity.icon}
                    </div>
                    <div className="pt-1">
                        <p className="text-gray-900 font-medium text-sm leading-snug">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                </div>
            ))}
            <button className="w-full py-2 text-sm text-center text-gray-500 hover:text-gray-900 border-t border-gray-100 mt-2">
                Xem tất cả hoạt động
            </button>
        </div>
    );
}
