// Parent-related types

export interface ParentClassInfo {
    id: number;
    class_id: number;
    class_name: string;
    grade: number;
    student_name: string;
    teacher_name: string;
    joined_at: string;
}

export interface TopicProgress {
    topic: string;
    status: string;
    percent: number;
}

export interface TodayAssignment {
    id: number;
    title: string;
    topic: string;
    status: string;
    correct: number;
    total: number;
}

export interface ParentDashboardData {
    student_name: string;
    class_name: string;
    teacher_name: string;
    stats: {
        completed: number;
        study_time: number;
        avg_score: number;
        accuracy: number;
    };
    topic_progress: TopicProgress[];
    teacher_comment: string;
    today_assignments: TodayAssignment[];
}

export interface WorksheetForParent {
    id: number;
    title: string;
    topic: string;
    grade: number;
    exercise_count: number;
    status: string;
    created_at: string;
}
