export type ProgressStatus = 'no_data' | 'improving' | 'stable' | 'needs_monitoring' | 'at_risk';
export type ScoreSource = 'none' | 'grade_entry' | 'student_progress' | 'mixed';

export interface RepeatedMistake {
    error_type: string;
    count: number;
    latest_detail?: string | null;
}

export interface ScoreTrendPoint {
    worksheet_id: number;
    worksheet_title: string;
    date: string;
    score: number;
    max_score: number;
    score_source: ScoreSource;
}

export interface RecentWorksheet {
    worksheet_id: number;
    worksheet_title: string;
    date: string;
    score: number;
    max_score: number;
    score_source: ScoreSource;
}

export interface RecentError {
    error_type: string;
    error_detail?: string | null;
    question_text?: string | null;
    created_at: string;
}

export interface PortfolioRecommendation {
    title: string;
    description: string;
    is_draft: boolean;
}

export interface StudentPortfolioCard {
    student_id: number;
    student_name: string;
    tier?: string | null;
    average_score: number;
    class_average_score: number;
    progress_status: ProgressStatus;
    progress_status_label: string;
    total_worksheets: number;
    total_error_records: number;
    latest_activity?: string | null;
    top_repeated_mistake?: RepeatedMistake | null;
    data_quality: string[];
    score_source: ScoreSource;
}

export interface ClassStudentPortfolios {
    class_id: number;
    class_name: string;
    grade: number;
    students: StudentPortfolioCard[];
}

export interface StudentPortfolioDetail {
    student_id: number;
    student_name: string;
    tier?: string | null;
    average_score: number;
    class_average_score: number;
    progress_status: ProgressStatus;
    progress_status_label: string;
    total_worksheets: number;
    total_error_records: number;
    score_trend: ScoreTrendPoint[];
    repeated_mistakes: RepeatedMistake[];
    recent_worksheets: RecentWorksheet[];
    recent_errors: RecentError[];
    recommendations: PortfolioRecommendation[];
    data_quality: string[];
    score_source: ScoreSource;
}
