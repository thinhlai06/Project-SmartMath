export interface Student {
    id: string;
    name: string;
    avgScore: number;
    recommendedTier: 'foundation' | 'standard' | 'extension' | 'advanced';
    avatar: string;
}

export interface DiffTier {
    id: 'foundation' | 'standard' | 'extension' | 'advanced';
    name: string;
    color: string;
    description: string;
    studentIds: string[];
}

export const MOCK_STUDENTS: Student[] = [
    { id: 's1', name: 'Nguyễn Văn An', avgScore: 4.5, recommendedTier: 'foundation', avatar: 'AN' },
    { id: 's2', name: 'Trần Thị Bình', avgScore: 6.8, recommendedTier: 'standard', avatar: 'B' },
    { id: 's3', name: 'Lê Văn Cường', avgScore: 7.2, recommendedTier: 'standard', avatar: 'C' },
    { id: 's4', name: 'Phạm Thị Dung', avgScore: 8.5, recommendedTier: 'extension', avatar: 'D' },
    { id: 's5', name: 'Hoàng Văn Em', avgScore: 9.5, recommendedTier: 'advanced', avatar: 'E' },
    { id: 's6', name: 'Vũ Thị Hoa', avgScore: 5.0, recommendedTier: 'foundation', avatar: 'H' },
    { id: 's7', name: 'Đặng Văn Giang', avgScore: 7.0, recommendedTier: 'standard', avatar: 'G' },
    { id: 's8', name: 'Bùi Thị Huệ', avgScore: 8.8, recommendedTier: 'extension', avatar: 'HU' },
];

export const MOCK_TIERS: DiffTier[] = [
    {
        id: 'foundation',
        name: 'Nhận biết (Cơ bản)',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        description: 'Dành cho học sinh cần củng cố kiến thức nền tảng.',
        studentIds: []
    },
    {
        id: 'standard',
        name: 'Thông hiểu (Tiêu chuẩn)',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Dành cho đa số học sinh trong lớp.',
        studentIds: []
    },
    {
        id: 'extension',
        name: 'Vận dụng (Mở rộng)',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Dành cho học sinh khá, giỏi.',
        studentIds: []
    },
    {
        id: 'advanced',
        name: 'Vận dụng cao (Nâng cao)',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'Thử thách dành cho học sinh xuất sắc.',
        studentIds: []
    }
];
