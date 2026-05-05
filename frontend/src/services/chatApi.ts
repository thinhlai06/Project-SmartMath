/**
 * Chat API client functions.
 * Handles chatbot API calls and SSE streaming.
 */
import api from './api';
import type {
    ChatMessageRequest,
    ChatResponse,
    ChatHistoryResponse,
    ChatSessionItem,
    StudentSpotlightData,
} from '@/types/chat';

export const chatApi = {
    /** Send a text message (non-streaming) */
    sendMessage: async (request: ChatMessageRequest): Promise<ChatResponse> => {
        const { data } = await api.post<ChatResponse>('/chat/send', request);
        return data;
    },

    /**
     * Send a text message with SSE streaming.
     * Returns an AbortController for cancellation.
     */
    sendMessageStream: (
        request: ChatMessageRequest,
        onChunk: (text: string) => void,
        onDone: (sessionId: string) => void,
        onError: (error: string) => void,
    ): AbortController => {
        const controller = new AbortController();

        (async () => {
            try {
                const response = await fetch('/api/chat/send-stream', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(request),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    onError(`HTTP ${response.status}: ${response.statusText}`);
                    return;
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    onError('Stream not available');
                    return;
                }

                const decoder = new TextDecoder();
                let buffer = '';
                let sessionId = '';
                let currentEvent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;

                        if (trimmed.startsWith('event: ')) {
                            currentEvent = trimmed.slice(7);
                            continue;
                        }

                        if (trimmed.startsWith('data: ')) {
                            const payload = trimmed.slice(6);

                            if (currentEvent === 'session_id') {
                                sessionId = payload;
                                currentEvent = '';
                                continue;
                            }

                            if (currentEvent === 'done' || payload === '[DONE]') {
                                onDone(sessionId);
                                currentEvent = '';
                                continue;
                            }

                            if (currentEvent === 'error') {
                                onError(payload);
                                currentEvent = '';
                                continue;
                            }

                            onChunk(payload);
                            currentEvent = '';
                        }
                    }
                }
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    onError((err as Error).message || 'Stream error');
                }
            }
        })();

        return controller;
    },

    /** Upload an image for analysis */
    analyzeImage: async (
        file: File,
        prompt?: string,
        sessionId?: string,
        analysisType?: string,
        classId?: number,
    ): Promise<ChatResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        if (prompt) formData.append('prompt', prompt);
        if (sessionId) formData.append('session_id', sessionId);
        if (analysisType) formData.append('analysis_type', analysisType);
        if (classId) formData.append('class_id', String(classId));

        const { data } = await api.post<ChatResponse>('/chat/analyze-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    /** Get chat history for a session */
    getHistory: async (sessionId: string): Promise<ChatHistoryResponse> => {
        const { data } = await api.get<ChatHistoryResponse>(`/chat/history/${sessionId}`);
        return data;
    },

    /** List all chat sessions */
    getSessions: async (): Promise<ChatSessionItem[]> => {
        const { data } = await api.get<ChatSessionItem[]>('/chat/sessions');
        return data;
    },

    /** Delete a chat session */
    deleteSession: async (sessionId: string): Promise<void> => {
        await api.delete(`/chat/sessions/${sessionId}`);
    },

    /** Get student spotlight data */
    getStudentSpotlight: async (classId: number, studentId: number): Promise<StudentSpotlightData> => {
        const { data } = await api.get<StudentSpotlightData>(
            `/ai/analytics/${classId}/student-spotlight/${studentId}`
        );
        return data;
    },
};

export default chatApi;
