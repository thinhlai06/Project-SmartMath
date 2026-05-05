export interface ChatMessageRequest {
    message: string;
    session_id?: string;
    class_id?: number;
    student_id?: number;
}

export interface ChatMessageData {
    role: 'user' | 'assistant';
    content: string;
    message_type: string;
    created_at?: string;
}

export interface ChatResponse {
    session_id: string;
    message: ChatMessageData;
    context?: Record<string, unknown>;
}

export interface ChatHistoryResponse {
    session_id: string;
    messages: ChatMessageData[];
    total_count: number;
}

export interface ChatSessionItem {
    session_id: string;
    last_message_preview: string;
    message_count: number;
    created_at: string;
    updated_at: string;
}

export interface StudentSpotlightData {
    student_name: string;
    student_id: number;
    tier?: string;
    total_worksheets: number;
    average_score: number;
    class_average_score: number;
    score_trend: { date: string; score: number; max_score: number }[];
    error_distribution: { error_type: string; count: number }[];
    recent_errors: {
        error_type: string;
        error_detail?: string;
        question_text?: string;
        student_answer?: string;
        correct_answer?: string;
        created_at: string;
    }[];
    total_error_records: number;
}
