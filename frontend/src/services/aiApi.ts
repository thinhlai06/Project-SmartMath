/**
 * AI API client functions.
 * Handles all AI-related API calls through the centralized axios instance.
 */
import api from './api';
import type {
    AnalyticsSubmitRequest,
    AnalyticsSubmitResponse,
    GradingResponse,
    AnalyticsResponse,
    AIStatusResponse,
    GradingReport,
    ExerciseExplanationResponse,
} from '@/types/ai';


export const aiApi = {
    /** Check AI services status */
    getStatus: async (): Promise<AIStatusResponse> => {
        const { data } = await api.get('/ai/status');
        return data;
    },

    /** Generate CPA questions */
    generateCPA: async (params: {
        topic_id: number;
        grade: number;
        objective: string;
        counts?: Record<string, number>;
    }) => {
        const { data } = await api.post('/ai/generate-cpa', params);
        return data;
    },

    /** Generate differentiation questions */
    generateDifferentiation: async (params: {
        topic_id: number;
        grade: number;
        objective: string;
        tiers?: string[];
    }) => {
        const { data } = await api.post('/ai/generate-differentiation', params);
        return data;
    },

    /** Grade an image */
    gradeImage: async (file: File, correctAnswersJson?: string): Promise<GradingResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        if (correctAnswersJson) {
            formData.append('correct_answers_json', correctAnswersJson);
        }
        const { data } = await api.post('/ai/grade-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /** Get class analytics */
    getAnalytics: async (classId: number): Promise<AnalyticsResponse> => {
        const { data } = await api.get(`/ai/analytics/${classId}`);
        return data;
    },

    /** Submit analytics tags from AI grading workflow */
    submitAnalytics: async (payload: AnalyticsSubmitRequest): Promise<AnalyticsSubmitResponse> => {
        const { data } = await api.post('/v1/ai/analytics/submit', payload);
        return data;
    },

    /** Export grading report as PDF */
    exportGradingReport: async (gradingData: {
        student_name: string;
        class_id: number;
        total_score: number;
        max_score: number;
        results: any[];
        raw_text: string;
    }): Promise<{ report_id: number; file_url: string }> => {
        const { data } = await api.post('/ai/grading-report/export', gradingData);
        return data;
    },

    /** Get reports for a class (parent view) */
    getReports: async (classId: number): Promise<GradingReport[]> => {
        const { data } = await api.get(`/parent/reports/${classId}`);
        return data;
    },

    /** Download report PDF */
    downloadReport: async (reportId: number): Promise<Blob> => {
        const { data } = await api.get(`/ai/grading-report/${reportId}/download`, {
            responseType: 'blob',
        });
        return data;
    },

    /** Generate AI explanation for a specific exercise */
    explainExercise: async (
        exerciseId: number,
        payload?: { student_answer?: string; response_style?: string }
    ): Promise<ExerciseExplanationResponse> => {
        const { data } = await api.post(`/ai/exercises/${exerciseId}/explanation`, payload ?? {});
        return data;
    },
};

export default aiApi;
