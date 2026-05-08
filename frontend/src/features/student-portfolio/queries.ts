import { useQuery } from '@tanstack/react-query';

import studentPortfolioApi from '@/services/studentPortfolioApi';

export const studentPortfolioQueryKeys = {
    all: ['student-portfolios'] as const,
    class: (classId: number | null) => [...studentPortfolioQueryKeys.all, 'class', classId] as const,
    detail: (classId: number | null, studentId: number | null) =>
        [...studentPortfolioQueryKeys.all, 'detail', classId, studentId] as const,
};

export function useClassStudentPortfolios(classId: number | null) {
    return useQuery({
        queryKey: studentPortfolioQueryKeys.class(classId),
        queryFn: () => studentPortfolioApi.getClassPortfolios(classId as number),
        enabled: typeof classId === 'number' && Number.isFinite(classId),
    });
}

export function useStudentPortfolio(classId: number | null, studentId: number | null) {
    return useQuery({
        queryKey: studentPortfolioQueryKeys.detail(classId, studentId),
        queryFn: () => studentPortfolioApi.getStudentPortfolio(classId as number, studentId as number),
        enabled:
            typeof classId === 'number' &&
            Number.isFinite(classId) &&
            typeof studentId === 'number' &&
            Number.isFinite(studentId),
    });
}
