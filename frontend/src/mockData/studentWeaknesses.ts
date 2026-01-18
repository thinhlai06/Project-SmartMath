export interface StudentWeakness {
    studentId: string;
    studentName: string;
    weaknesses: string[];
}

export const MOCK_STUDENT_WEAKNESSES: StudentWeakness[] = [
    {
        studentId: 's1',
        studentName: 'Nguyễn Văn An',
        weaknesses: ['Phép cộng có nhớ', 'Hình học không gian', 'Giải toán có lời văn']
    },
    {
        studentId: 's2',
        studentName: 'Trần Thị Bình',
        weaknesses: ['Bảng cửu chương 7', 'Tính diện tích']
    },
    {
        studentId: 's4',
        studentName: 'Phạm Thị Dung',
        weaknesses: ['Phân số', 'Quy đồng mẫu số']
    },
    {
        studentId: 's5',
        studentName: 'Hoàng Văn Em',
        weaknesses: ['Xác suất thống kê cơ bản']
    }
];
