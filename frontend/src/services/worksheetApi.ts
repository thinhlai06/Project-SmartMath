import api from './api';

// === Types ===

export type WorksheetStatus = 'draft' | 'published';
export type WorksheetType = 'cpa' | 'differentiation';
export type ExerciseType = 'concrete' | 'pictorial' | 'abstract';
export type DifficultyTier = 'foundation' | 'standard' | 'extension' | 'advanced';

export interface Worksheet {
    id: number;
    title: string;
    class_id: number;
    topic_id: number | null;
    grade: number;
    difficulty: string | null;
    status: WorksheetStatus;
    worksheet_type: WorksheetType;
    objective: string | null;
    created_at: string;
    published_at: string | null;
    exercise_count: number;
}

export interface WorksheetDetail extends Worksheet {
    exercises: Exercise[];
}

export interface WorksheetCreate {
    title: string;
    topic_id?: number | null;
    grade: number;
    worksheet_type: WorksheetType;
    objective?: string;
    difficulty?: string;
}

export interface WorksheetUpdate {
    title?: string;
    topic_id?: number | null;
    difficulty?: string;
    objective?: string;
}

export interface Exercise {
    id: number;
    worksheet_id: number;
    question: string;
    answer: string | null;
    hint: string | null;
    exercise_type: ExerciseType | null;
    difficulty_tier: DifficultyTier | null;
    order_index: number;
}

export interface ExerciseCreate {
    question: string;
    answer?: string;
    hint?: string;
    exercise_type?: ExerciseType;
    difficulty_tier?: DifficultyTier;
    order_index?: number;
}

export interface ExerciseUpdate {
    question?: string;
    answer?: string;
    hint?: string;
    exercise_type?: ExerciseType;
    difficulty_tier?: DifficultyTier;
    order_index?: number;
}

// === Worksheet API ===

export const worksheetApi = {
    // Get all worksheets for a class
    getWorksheets: async (
        classId: number,
        status?: WorksheetStatus,
        worksheetType?: WorksheetType
    ): Promise<Worksheet[]> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (worksheetType) params.append('worksheet_type', worksheetType);

        const response = await api.get<Worksheet[]>(
            `/classes/${classId}/worksheets?${params.toString()}`
        );
        return response.data;
    },

    // Get worksheet detail with exercises
    getWorksheet: async (worksheetId: number): Promise<WorksheetDetail> => {
        const response = await api.get<WorksheetDetail>(`/worksheets/${worksheetId}`);
        return response.data;
    },

    // Create a new worksheet
    createWorksheet: async (classId: number, data: WorksheetCreate): Promise<Worksheet> => {
        const response = await api.post<Worksheet>(`/classes/${classId}/worksheets`, data);
        return response.data;
    },

    // Update worksheet
    updateWorksheet: async (worksheetId: number, data: WorksheetUpdate): Promise<Worksheet> => {
        const response = await api.put<Worksheet>(`/worksheets/${worksheetId}`, data);
        return response.data;
    },

    // Delete worksheet
    deleteWorksheet: async (worksheetId: number): Promise<void> => {
        await api.delete(`/worksheets/${worksheetId}`);
    },

    // Publish worksheet
    publishWorksheet: async (worksheetId: number): Promise<Worksheet> => {
        const response = await api.post<Worksheet>(`/worksheets/${worksheetId}/publish`);
        return response.data;
    },

    // Unpublish worksheet
    unpublishWorksheet: async (worksheetId: number): Promise<Worksheet> => {
        const response = await api.post<Worksheet>(`/worksheets/${worksheetId}/unpublish`);
        return response.data;
    },

    // Duplicate worksheet
    duplicateWorksheet: async (worksheetId: number, newTitle?: string): Promise<Worksheet> => {
        const params = newTitle ? `?new_title=${encodeURIComponent(newTitle)}` : '';
        const response = await api.post<Worksheet>(`/worksheets/${worksheetId}/duplicate${params}`);
        return response.data;
    },
};

// === Exercise API ===

export const exerciseApi = {
    // Get all exercises for a worksheet
    getExercises: async (worksheetId: number): Promise<Exercise[]> => {
        const response = await api.get<Exercise[]>(`/worksheets/${worksheetId}/exercises`);
        return response.data;
    },

    // Create a new exercise
    createExercise: async (worksheetId: number, data: ExerciseCreate): Promise<Exercise> => {
        const response = await api.post<Exercise>(`/worksheets/${worksheetId}/exercises`, data);
        return response.data;
    },

    // Get single exercise
    getExercise: async (exerciseId: number): Promise<Exercise> => {
        const response = await api.get<Exercise>(`/exercises/${exerciseId}`);
        return response.data;
    },

    // Update exercise
    updateExercise: async (exerciseId: number, data: ExerciseUpdate): Promise<Exercise> => {
        const response = await api.put<Exercise>(`/exercises/${exerciseId}`, data);
        return response.data;
    },

    // Delete exercise
    deleteExercise: async (exerciseId: number): Promise<void> => {
        await api.delete(`/exercises/${exerciseId}`);
    },

    // Reorder exercises
    reorderExercises: async (worksheetId: number, exerciseIds: number[]): Promise<Exercise[]> => {
        const response = await api.put<Exercise[]>(
            `/worksheets/${worksheetId}/exercises/reorder`,
            { exercise_ids: exerciseIds }
        );
        return response.data;
    },
};
