import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockApi } = vi.hoisted(() => ({
    mockApi: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('./api', () => ({
    default: mockApi,
}));

import interventionApi from './interventionApi';

describe('interventionApi service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generatePlan calls intervention generate endpoint', async () => {
        mockApi.post.mockResolvedValueOnce({
            data: {
                id: 1,
                class_id: 2,
                class_name: '2A',
                grade: 2,
                week_number: 19,
                year: 2026,
                status: 'draft',
                notes: null,
                groups: [],
                total_students: 0,
                created_at: '2026-05-09T12:00:00',
                approved_at: null,
            },
        });

        const result = await interventionApi.generatePlan(2, 19, 2026);

        expect(mockApi.post).toHaveBeenCalledWith('/intervention/generate', {
            class_id: 2,
            week_number: 19,
            year: 2026,
        });
        expect(result.id).toBe(1);
    });

    it('linkWorksheet calls group worksheet link endpoint', async () => {
        mockApi.put.mockResolvedValueOnce({
            data: {
                id: 10,
                group_name: 'Cần luyện kỹ năng tính',
                error_type: 'tinh_sai',
                evidence: [],
                suggested_activity: 'Luyện cơ bản',
                suggested_exercises: { foundation: 8, standard: 4 },
                duration_minutes: 15,
                student_ids: [1, 2],
                student_names: ['A', 'B'],
                worksheet_id: 99,
                order_index: 0,
                notes: null,
            },
        });

        const result = await interventionApi.linkWorksheet(10, 99);

        expect(mockApi.put).toHaveBeenCalledWith('/intervention/groups/10/link-worksheet', {
            worksheet_id: 99,
        });
        expect(result.worksheet_id).toBe(99);
    });
});
