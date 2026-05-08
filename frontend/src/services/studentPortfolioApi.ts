import api from './api';
import type { ClassStudentPortfolios, StudentPortfolioDetail } from '@/types/studentPortfolio';

export const studentPortfolioApi = {
    getClassPortfolios: async (classId: number): Promise<ClassStudentPortfolios> => {
        const { data } = await api.get<ClassStudentPortfolios>(`/v1/classes/${classId}/student-portfolios`);
        return data;
    },

    getStudentPortfolio: async (classId: number, studentId: number): Promise<StudentPortfolioDetail> => {
        const { data } = await api.get<StudentPortfolioDetail>(`/v1/classes/${classId}/students/${studentId}/portfolio`);
        return data;
    },
};

export default studentPortfolioApi;
