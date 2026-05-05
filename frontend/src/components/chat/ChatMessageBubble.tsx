import { User, Bot } from 'lucide-react';
import type { ChatMessageData } from '@/types/chat';

interface ChatMessageBubbleProps {
    message: ChatMessageData;
    isStreaming?: boolean;
    streamingContent?: string;
}

function formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

function renderMarkdown(text: string): string {
    return text
        .replace(/### (.+)/g, '<h3 class="font-bold text-sm mt-2 mb-1">$1</h3>')
        .replace(/## (.+)/g, '<h2 class="font-bold text-base mt-2 mb-1">$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code class="bg-black/10 px-1 rounded text-sm">$1</code>')
        .replace(/^- (.+)/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^(\d+)\. (.+)/gm, '<li class="ml-4 list-decimal">$2</li>')
        .replace(/\n/g, '<br />');
}

export function ChatMessageBubble({ message, isStreaming, streamingContent }: ChatMessageBubbleProps) {
    const isUser = message.role === 'user';
    const isError = message.message_type === 'error';
    const content = isStreaming && streamingContent ? streamingContent : message.content;

    return (
        <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
                    isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
            >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                            ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                            : isError
                              ? 'bg-red-50 border border-red-200 text-red-700 rounded-xl'
                              : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
                    }`}
                >
                    {isUser ? (
                        <span>{content}</span>
                    ) : (
                        <div
                            className="chat-markdown"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                        />
                    )}
                    {isStreaming && <span className="inline-block ml-0.5 animate-pulse">▊</span>}
                </div>
                {message.created_at && (
                    <span className="text-xs text-gray-400 mt-1 px-1">{formatTime(message.created_at)}</span>
                )}
            </div>
        </div>
    );
}
