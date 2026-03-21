// Centralized type exports for Smart-MathAI

// Auth types
export type { User, UserRole, LoginRequest, RegisterRequest, UpdateMeRequest, AuthResponse, Token, ApiError } from './auth';

// Domain types
export type {
    Worksheet, WorksheetDetail, Exercise,
    WorksheetCreate, WorksheetUpdate,
    ExerciseCreate, ExerciseUpdate,
    WorksheetStatus, WorksheetType, ExerciseType, DifficultyTier
} from './worksheet';

export type { MathClass, Student, MathTopic } from './class';

export type {
    GradeResult, GradingResponse,
    WeakTopic, StudentPerformance, MistakePattern,
    AnalyticsResponse, AIStatusResponse, GradingReport
} from './ai';

export type {
    ParentClassInfo, TopicProgress, TodayAssignment,
    ParentDashboardData, WorksheetForParent
} from './parent';
