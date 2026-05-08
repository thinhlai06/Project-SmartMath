import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockApi } = vi.hoisted(() => ({
    mockApi: {
        get: vi.fn(),
    },
}));

vi.mock('./api', () => ({
    default: mockApi,
}));

import studentPortfolioApi from './studentPortfolioApi';

describe('studentPortfolioApi service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getClassPortfolios calls v1 class portfolio endpoint', async () => {
        mockApi.get.mockResolvedValueOnce({
            data: {
                class_id: 1,
                class_name: '2A',
                grade: 2,
                students: [],
            },
        });

        const result = await studentPortfolioApi.getClassPortfolios(1);

        expect(mockApi.get).toHaveBeenCalledWith('/v1/classes/1/student-portfolios');
        expect(result.class_id).toBe(1);
    });

    it('getStudentPortfolio calls v1 student detail endpoint', async () => {
        mockApi.get.mockResolvedValueOnce({
            data: {
                student_id: 10,
                student_name: 'Nguyen Van A',
                tier: 'standard',
                average_score: 8,
                class_average_score: 7,
                progress_status: 'stable',
                progress_status_label: 'Ổn định',
                total_worksheets: 1,
                total_error_records: 0,
                score_trend: [],
                repeated_mistakes: [],
                recent_worksheets: [],
                recent_errors: [],
                recommendations: [],
                data_quality: [],
                score_source: 'grade_entry',
            },
        });

        const result = await studentPortfolioApi.getStudentPortfolio(1, 10);

        expect(mockApi.get).toHaveBeenCalledWith('/v1/classes/1/students/10/portfolio');
        expect(result.student_id).toBe(10);
    });
});
