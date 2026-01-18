export const mockErrorStats = {
    totalErrors: 1240,
    mostCommonType: "Tính toán",
    avgCorrectionTime: "2.5 ngày",
    criticalStudents: 5
};

export const mockTopErrors = [
    {
        id: 1,
        name: "Phép chia có dư (Lớp 3)",
        count: 450,
        percentage: 36,
        trend: "up" as const, // 'up' | 'down' | 'stable'
        trendValue: 12
    },
    {
        id: 2,
        name: "Quy đồng mẫu số (Lớp 4)",
        count: 310,
        percentage: 25,
        trend: "stable" as const,
        trendValue: 0
    },
    {
        id: 3,
        name: "Bài toán tìm x (Lớp 2)",
        count: 280,
        percentage: 22,
        trend: "down" as const,
        trendValue: 5
    },
    {
        id: 4,
        name: "Đổi đơn vị đo độ dài",
        count: 120,
        percentage: 10,
        trend: "down" as const,
        trendValue: 8
    }
];

export const mockStudentsNeedingSupport = [
    {
        id: 1,
        name: "Nguyễn Văn An",
        class: "3A",
        errorRate: "65%",
        topIssue: "Phép chia",
        status: "critical" as const // 'critical' | 'warning'
    },
    {
        id: 2,
        name: "Trần Thị Bình",
        class: "3A",
        errorRate: "58%",
        topIssue: "Hình học",
        status: "critical" as const
    },
    {
        id: 3,
        name: "Phạm Văn Cường",
        class: "3B",
        errorRate: "45%",
        topIssue: "Tính nhẩm",
        status: "warning" as const
    },
    {
        id: 4,
        name: "Lê Thị Dung",
        class: "3A",
        errorRate: "42%",
        topIssue: "Đổi đơn vị",
        status: "warning" as const
    }
];
