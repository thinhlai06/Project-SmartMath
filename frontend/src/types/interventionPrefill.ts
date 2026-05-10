export type InterventionPrefillSource = 'intervention';

export interface InterventionWorksheetPrefillState {
    source: InterventionPrefillSource;
    planId: number;
    groupId: number;
    classId: number;
    grade: 1 | 2 | 3;
    errorType: string;
    groupName: string;
    suggestedActivity: string;
    suggestedExercises: Record<string, number>;
    studentIds: number[];
    studentNames: string[];
}

export function isInterventionWorksheetPrefillState(value: unknown): value is InterventionWorksheetPrefillState {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<InterventionWorksheetPrefillState>;
    return candidate.source === 'intervention'
        && typeof candidate.planId === 'number'
        && typeof candidate.groupId === 'number'
        && typeof candidate.classId === 'number'
        && (candidate.grade === 1 || candidate.grade === 2 || candidate.grade === 3)
        && typeof candidate.errorType === 'string'
        && typeof candidate.groupName === 'string'
        && typeof candidate.suggestedActivity === 'string'
        && typeof candidate.suggestedExercises === 'object'
        && candidate.suggestedExercises !== null
        && Array.isArray(candidate.studentIds)
        && Array.isArray(candidate.studentNames);
}
