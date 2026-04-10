export type DiffTierId = 'foundation' | 'standard' | 'extension' | 'advanced';

export interface DiffTierConfig {
    id: DiffTierId;
    name: string;
    description: string;
}

export const DIFF_TIERS: DiffTierConfig[] = [
    {
        id: 'foundation',
        name: 'Nhận biết (Cơ bản)',
        description: 'Dành cho học sinh cần củng cố kiến thức nền tảng.',
    },
    {
        id: 'standard',
        name: 'Thông hiểu (Tiêu chuẩn)',
        description: 'Dành cho đa số học sinh trong lớp.',
    },
    {
        id: 'extension',
        name: 'Vận dụng (Mở rộng)',
        description: 'Dành cho học sinh khá, giỏi.',
    },
    {
        id: 'advanced',
        name: 'Vận dụng cao (Nâng cao)',
        description: 'Thử thách dành cho học sinh xuất sắc.',
    },
];

export const DIFF_TIER_IDS: DiffTierId[] = DIFF_TIERS.map((tier) => tier.id);

export function isDiffTierId(value: string | null | undefined): value is DiffTierId {
    if (!value) {
        return false;
    }
    return DIFF_TIER_IDS.includes(value as DiffTierId);
}