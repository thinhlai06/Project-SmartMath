import { useState, useCallback, useRef } from 'react';
import { chatApi } from '@/services/chatApi';
import type { ChatMessageData, StudentSpotlightData } from '@/types/chat';

interface UseChatbotOptions {
    classId?: number;
    studentId?: number;
}

export function useChatbot(options: UseChatbotOptions = {}) {
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>();
    const [isOpen, setIsOpen] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [spotlightData, setSpotlightData] = useState<StudentSpotlightData | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(
        (text: string) => {
            if (!text.trim() || isLoading) return;

            const userMsg: ChatMessageData = {
                role: 'user',
                content: text,
                message_type: 'text',
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMsg]);
            setIsLoading(true);
            setStreamingContent('');

            const controller = chatApi.sendMessageStream(
                {
                    message: text,
                    session_id: sessionId,
                    class_id: options.classId,
                    student_id: options.studentId,
                },
                (chunk) => {
                    setStreamingContent((prev) => prev + chunk);
                },
                (newSessionId) => {
                    setSessionId(newSessionId || sessionId);
                    setStreamingContent((prev) => {
                        if (prev) {
                            const assistantMsg: ChatMessageData = {
                                role: 'assistant',
                                content: prev,
                                message_type: 'text',
                                created_at: new Date().toISOString(),
                            };
                            setMessages((msgs) => [...msgs, assistantMsg]);
                        }
                        return '';
                    });
                    setIsLoading(false);
                    abortRef.current = null;
                },
                (error) => {
                    const errorMsg: ChatMessageData = {
                        role: 'assistant',
                        content: `❌ Lỗi: ${error}`,
                        message_type: 'error',
                        created_at: new Date().toISOString(),
                    };
                    setMessages((prev) => [...prev, errorMsg]);
                    setStreamingContent('');
                    setIsLoading(false);
                    abortRef.current = null;
                },
            );

            abortRef.current = controller;
        },
        [isLoading, sessionId, options.classId, options.studentId],
    );

    const sendImage = useCallback(
        async (file: File, prompt?: string, analysisType?: string) => {
            if (isLoading) return;

            const userMsg: ChatMessageData = {
                role: 'user',
                content: prompt || `📷 Phân tích ảnh (${analysisType || 'homework'})`,
                message_type: 'image',
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMsg]);
            setIsLoading(true);

            try {
                const response = await chatApi.analyzeImage(
                    file,
                    prompt,
                    sessionId,
                    analysisType,
                    options.classId,
                );

                setSessionId(response.session_id);

                const assistantMsg: ChatMessageData = {
                    role: 'assistant',
                    content: response.message.content,
                    message_type: response.message.message_type,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } catch (err) {
                const errorMsg: ChatMessageData = {
                    role: 'assistant',
                    content: `❌ Lỗi phân tích ảnh: ${(err as Error).message}`,
                    message_type: 'error',
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, errorMsg]);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, sessionId, options.classId],
    );

    const stopStreaming = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;

        setStreamingContent((prev) => {
            if (prev) {
                const msg: ChatMessageData = {
                    role: 'assistant',
                    content: prev + '\n\n_(Đã dừng)_',
                    message_type: 'text',
                    created_at: new Date().toISOString(),
                };
                setMessages((msgs) => [...msgs, msg]);
            }
            return '';
        });
        setIsLoading(false);
    }, []);

    const clearChat = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        setMessages([]);
        setStreamingContent('');
        setSessionId(undefined);
        setIsLoading(false);
        setSpotlightData(null);
    }, []);

    const fetchSpotlight = useCallback(
        async (classIdOverride?: number, studentIdOverride?: number) => {
            const cid = classIdOverride ?? options.classId;
            const sid = studentIdOverride ?? options.studentId;
            if (!cid || !sid) return;
            try {
                const data = await chatApi.getStudentSpotlight(cid, sid);
                setSpotlightData(data);
            } catch (err) {
                console.error('Failed to fetch spotlight:', err);
            }
        },
        [options.classId, options.studentId],
    );

    const loadSession = useCallback(async (sid: string) => {
        try {
            const history = await chatApi.getHistory(sid);
            setMessages(history.messages);
            setSessionId(sid);
        } catch (err) {
            console.error('Failed to load session:', err);
        }
    }, []);

    return {
        messages,
        isLoading,
        sessionId,
        isOpen,
        setIsOpen,
        streamingContent,
        spotlightData,
        sendMessage,
        sendImage,
        stopStreaming,
        clearChat,
        loadSession,
        fetchSpotlight,
    };
}
