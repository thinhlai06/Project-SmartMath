import api from './api';

export interface GradebookResponse {
    class_id: number;
    worksheets: { id: number; title: string }[];
    student_records: {
        student_id: number;
        full_name: string;
        grades: Record<number, number>;
    }[];
}

export interface GradebookProgressPayload {
    correct_count: number;
    total_count: number;
    details?: Record<string, unknown>;
}

export const gradebookApi = {
    getGradebook: async (classId: number): Promise<GradebookResponse> => {
        const response = await api.get(`/gradebook/classes/${classId}`);
        return response.data;
    },
    
    saveGrade: async (
        studentId: number,
        worksheetId: number,
        score: number,
        progress?: GradebookProgressPayload,
    ) => {
        const response = await api.post(`/gradebook/entries`, {
            student_id: studentId,
            worksheet_id: worksheetId,
            score,
            ...(progress ?? {}),
        });
        return response.data;
    },
    
    exportExcelUrl: (classId: number) => {
        return `/api/gradebook/classes/${classId}/export`;
    }
};
