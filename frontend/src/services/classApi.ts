import api from './api';

// Types
export interface MathClass {
    id: number;
    class_name: string;
    grade: number;
    class_code: string;
    student_count: number;
    teacher_id?: number;
    created_at?: string;
}

export interface ClassCreate {
    class_name: string;
    grade: number;
    description?: string;
}

export interface ClassUpdate {
    class_name?: string;
    grade?: number;
    description?: string;
}

export interface Student {
    id: number;
    full_name: string;
    tier: string;
    class_id: number;
    created_at: string;
}

export interface StudentCreate {
    full_name: string;
    tier?: 'foundation' | 'standard' | 'extension' | 'advanced';
}

export interface MathTopic {
    id: number;
    topic_name: string;
    category: string;
    grade: number;
}

// Class API
export const classApi = {
    // Get all classes for the current teacher
    getClasses: async (): Promise<MathClass[]> => {
        const response = await api.get<MathClass[]>('/classes');
        return response.data;
    },

    // Get a single class by ID
    getClass: async (classId: number): Promise<MathClass> => {
        const response = await api.get<MathClass>(`/classes/${classId}`);
        return response.data;
    },

    // Create a new class
    createClass: async (data: ClassCreate): Promise<MathClass> => {
        const response = await api.post<MathClass>('/classes', data);
        return response.data;
    },

    // Update a class
    updateClass: async (classId: number, data: ClassUpdate): Promise<MathClass> => {
        const response = await api.put<MathClass>(`/classes/${classId}`, data);
        return response.data;
    },

    // Delete a class
    deleteClass: async (classId: number): Promise<void> => {
        await api.delete(`/classes/${classId}`);
    },

    // Regenerate class code
    regenerateCode: async (classId: number): Promise<MathClass> => {
        const response = await api.post<MathClass>(`/classes/${classId}/regenerate-code`);
        return response.data;
    },
};

// Student API
export const studentApi = {
    // Get all students in a class
    getStudents: async (classId: number, tier?: string): Promise<Student[]> => {
        const params = tier ? { tier } : {};
        const response = await api.get<Student[]>(`/classes/${classId}/students`, { params });
        return response.data;
    },

    // Add a student to a class
    createStudent: async (classId: number, data: StudentCreate): Promise<Student> => {
        const response = await api.post<Student>(`/classes/${classId}/students`, data);
        return response.data;
    },

    // Get a single student
    getStudent: async (studentId: number): Promise<Student> => {
        const response = await api.get<Student>(`/students/${studentId}`);
        return response.data;
    },

    // Update a student
    updateStudent: async (studentId: number, data: Partial<StudentCreate>): Promise<Student> => {
        const response = await api.put<Student>(`/students/${studentId}`, data);
        return response.data;
    },

    // Delete a student
    deleteStudent: async (studentId: number): Promise<void> => {
        await api.delete(`/students/${studentId}`);
    },
};

// Topic API
export const topicApi = {
    // Get all topics, optionally filtered by grade
    getTopics: async (grade?: number): Promise<MathTopic[]> => {
        const params = grade ? { grade } : {};
        const response = await api.get<MathTopic[]>('/topics', { params });
        return response.data;
    },

    // Get a single topic
    getTopic: async (topicId: number): Promise<MathTopic> => {
        const response = await api.get<MathTopic>(`/topics/${topicId}`);
        return response.data;
    },
};
