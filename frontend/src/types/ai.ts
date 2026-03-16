// AI-related types (centralized from inline page definitions)

export interface GradeResult {
    question_id: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    score: number;
    max_score: number;
    question_text?: string;
    question_type?: string;
    reasoning?: string;
    feedback?: string;
}

export interface GradingResponse {
    total_score: number;
    max_score: number;
    results: GradeResult[];
    raw_text: string;
    extracted_json?: Record<string, string>;
}

export interface WeakTopic {
    topic: string;
    accuracy: number;
    total_questions: number;
}

export interface StudentPerformance {
    student: string;
    average_score: number;
    assignment_count: number;
}

export interface MistakePattern {
    type: string;
    count: number;
}

export interface AnalyticsResponse {
    weak_topics: WeakTopic[];
    student_performance: StudentPerformance[];
    common_mistakes: MistakePattern[];
}

export interface AIStatusResponse {
    lmstudio: string;
    model: string;
    vector_db: string;
}

export interface GradingReport {
    id: number;
    student_name: string;
    worksheet_title: string;
    total_score: number;
    max_score: number;
    created_at: string;
    file_url: string;
}
