// Class and student-related types (centralized from classApi.ts)

export interface MathClass {
    id: number;
    class_name: string;
    grade: number;
    class_code: string;
    description: string | null;
    teacher_id: number;
    created_at: string;
    student_count?: number;
}

export interface Student {
    id: number;
    full_name: string;
    class_id: number;
    created_at: string;
}

export interface MathTopic {
    id: number;
    topic_name: string;
    grade: number;
    description: string | null;
}
