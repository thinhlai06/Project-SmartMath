export interface Announcement {
    id: number;
    class_id: number;
    title: string;
    content: string;
    created_at: string;
    author_name: string;
}

export const mockAnnouncements: Announcement[] = [
    {
        id: 1,
        class_id: 1,
        title: "Thông báo lịch nghỉ Tết Nguyên Đán",
        content: "Chào quý phụ huynh và các em học sinh, lớp chúng ta sẽ bắt đầu nghỉ Tết từ ngày 25/01/2026. Chúc gia đình năm mới an khang thịnh vượng!",
        created_at: "2026-01-15T08:00:00",
        author_name: "Cô Nguyễn Thị Lan"
    },
    {
        id: 2,
        class_id: 1,
        title: "Nhắc nhở hoàn thành bài tập CPA",
        content: "Các em nhớ hoàn thành bài tập 'Phép chia có dư' trước thứ Hai tuần sau nhé. Bài tập đã được xuất bản trên hệ thống.",
        created_at: "2026-01-14T14:30:00",
        author_name: "Cô Nguyễn Thị Lan"
    },
    {
        id: 3,
        class_id: 1,
        title: "Kết quả kiểm tra giữa kỳ",
        content: "Kết quả kiểm tra đã được cập nhật. Phụ huynh vui lòng xem chi tiết trong phần Tiến độ học tập của con.",
        created_at: "2026-01-10T09:15:00",
        author_name: "Cô Nguyễn Thị Lan"
    }
];
