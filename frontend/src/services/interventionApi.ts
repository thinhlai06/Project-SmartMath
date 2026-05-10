import api from './api';

export interface InterventionEvidenceItem {
    student_id?: number;
    student_name?: string;
    question_text?: string | null;
    student_answer?: string | null;
    correct_answer?: string | null;
    created_at?: string;
}

export interface InterventionGroup {
    id: number;
    group_name: string;
    error_type: string;
    evidence: InterventionEvidenceItem[];
    suggested_activity: string;
    suggested_exercises: Record<string, number>;
    duration_minutes: number;
    student_ids: number[];
    student_names: string[];
    worksheet_id: number | null;
    order_index: number;
    notes: string | null;
}

export interface InterventionPlan {
    id: number;
    class_id: number;
    class_name: string;
    grade: 1 | 2 | 3;
    week_number: number;
    year: number;
    status: 'draft' | 'approved' | 'completed';
    notes: string | null;
    groups: InterventionGroup[];
    total_students: number;
    created_at: string;
    approved_at: string | null;
}

export interface InterventionPlanListItem {
    id: number;
    week_number: number;
    year: number;
    status: 'draft' | 'approved' | 'completed';
    total_groups: number;
    total_students: number;
    created_at: string;
}

export interface UpdateInterventionGroupPayload {
    suggested_activity?: string;
    suggested_exercises?: Record<string, number>;
    duration_minutes?: number;
    notes?: string;
}

export const interventionApi = {
    generatePlan: async (classId: number, weekNumber: number, year: number): Promise<InterventionPlan> => {
        const { data } = await api.post<InterventionPlan>('/intervention/generate', {
            class_id: classId,
            week_number: weekNumber,
            year,
        });
        return data;
    },

    getPlansForClass: async (classId: number, limit: number = 20): Promise<InterventionPlanListItem[]> => {
        const { data } = await api.get<InterventionPlanListItem[]>(`/intervention/class/${classId}`, {
            params: { limit },
        });
        return data;
    },

    getPlan: async (planId: number): Promise<InterventionPlan> => {
        const { data } = await api.get<InterventionPlan>(`/intervention/${planId}`);
        return data;
    },

    approvePlan: async (planId: number, notes?: string): Promise<InterventionPlan> => {
        const { data } = await api.put<InterventionPlan>(`/intervention/${planId}/approve`, { notes: notes ?? null });
        return data;
    },

    completePlan: async (planId: number): Promise<InterventionPlan> => {
        const { data } = await api.put<InterventionPlan>(`/intervention/${planId}/complete`);
        return data;
    },

    updateGroup: async (groupId: number, updates: UpdateInterventionGroupPayload): Promise<InterventionGroup> => {
        const { data } = await api.put<InterventionGroup>(`/intervention/groups/${groupId}`, updates);
        return data;
    },

    linkWorksheet: async (groupId: number, worksheetId: number): Promise<InterventionGroup> => {
        const { data } = await api.put<InterventionGroup>(`/intervention/groups/${groupId}/link-worksheet`, {
            worksheet_id: worksheetId,
        });
        return data;
    },

    deletePlan: async (planId: number): Promise<void> => {
        await api.delete(`/intervention/${planId}`);
    },
};

export default interventionApi;
