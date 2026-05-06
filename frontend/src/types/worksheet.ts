// Worksheet-related types (centralized from worksheetApi.ts)

export type WorksheetStatus = "draft" | "published";
export type WorksheetType = "differentiation";
export type DifficultyTier = "foundation" | "standard" | "extension" | "advanced";

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

export interface Exercise {
    id: number;
    worksheet_id: number;
    question: string;
    answer: string | null;
    hint: string | null;
    image_url: string | null;
    difficulty_tier: DifficultyTier | null;
    order_index: number;
}

export interface WorksheetCreate {
    title: string;
    topic_id?: number;
    grade: number;
    worksheet_type: WorksheetType;
    objective?: string;
    difficulty?: string;
}

export interface WorksheetUpdate {
    title?: string;
    topic_id?: number;
    difficulty?: string;
    objective?: string;
}

export interface ExerciseCreate {
    question: string;
    answer?: string;
    hint?: string;
    difficulty_tier?: DifficultyTier;
    order_index?: number;
}

export interface ExerciseUpdate {
    question?: string;
    answer?: string;
    hint?: string;
    difficulty_tier?: DifficultyTier;
    order_index?: number;
}
