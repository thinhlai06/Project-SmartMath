import { useEffect, useRef } from 'react';
import { X, Trash2, Bot } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatInput } from './ChatInput';
import { StudentSpotlightCharts } from './StudentSpotlightCharts';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    classId?: number;
    studentId?: number;
}

const QUICK_ACTIONS = [
    { label: '📊 Phân tích lớp', message: 'Phân tích kết quả lớp tôi tuần này' },
    { label: '📝 Sinh bài tập', message: 'Tôi muốn sinh bài tập mới' },
    { label: '📖 Gợi ý giáo án', message: 'Gợi ý giáo án cho tiết dạy sắp tới' },
    { label: '💡 Tư vấn CPA', message: 'Cách dạy theo phương pháp CPA' },
];

export function ChatPanel({ isOpen, onClose, classId, studentId }: ChatPanelProps) {
    const {
        messages,
        isLoading,
        streamingContent,
        spotlightData,
        sendMessage,
        sendImage,
        stopStreaming,
        clearChat,
        fetchSpotlight,
    } = useChatbot({ classId, studentId });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    if (!isOpen) return null;

    const isEmpty = messages.length === 0 && !streamingContent;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-800">Trợ lý AI</h3>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-xs text-gray-500">Sẵn sàng</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={clearChat}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Xóa cuộc trò chuyện"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Đóng"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {isEmpty && (
                        <div className="text-center mt-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                <Bot className="w-8 h-8 text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">
                                👋 Xin chào! Tôi là trợ lý AI của Smart-MathAI.
                            </p>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                                Tôi có thể giúp bạn phân tích kết quả lớp học, tìm hiểu tiến bộ
                                từng học sinh, gợi ý bài tập, phân tích bài làm, tư vấn CPA, và
                                lên kế hoạch bài dạy.
                            </p>

                            {/* Quick action chips */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {QUICK_ACTIONS.map((action) => (
                                    <button
                                        key={action.label}
                                        type="button"
                                        onClick={() => sendMessage(action.message)}
                                        className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i}>
                            <ChatMessageBubble message={msg} />
                            {msg.role === 'assistant' &&
                                msg.message_type === 'student_spotlight' &&
                                spotlightData && (
                                    <StudentSpotlightCharts data={spotlightData} />
                                )}
                        </div>
                    ))}

                    {streamingContent && (
                        <ChatMessageBubble
                            message={{
                                role: 'assistant',
                                content: '',
                                message_type: 'text',
                            }}
                            isStreaming
                            streamingContent={streamingContent}
                        />
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <ChatInput
                    onSend={sendMessage}
                    onSendImage={sendImage}
                    isLoading={isLoading}
                    onStop={stopStreaming}
                />
            </div>
        </>
    );
}
