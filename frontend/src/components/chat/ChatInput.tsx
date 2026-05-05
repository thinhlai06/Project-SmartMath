import { useState, useRef, useCallback } from 'react';
import { Send, Square, ImagePlus } from 'lucide-react';

interface ChatInputProps {
    onSend: (text: string) => void;
    onSendImage: (file: File, prompt?: string) => void;
    isLoading: boolean;
    onStop: () => void;
}

export function ChatInput({ onSend, onSendImage, isLoading, onStop }: ChatInputProps) {
    const [text, setText] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;
        onSend(trimmed);
        setText('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [text, isLoading, onSend]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend],
    );

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 100) + 'px';
    }, []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                onSendImage(file);
                e.target.value = '';
            }
        },
        [onSendImage],
    );

    return (
        <div className="flex items-end gap-2 p-3 border-t bg-white">
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="Tải ảnh lên"
            >
                <ImagePlus className="w-5 h-5" />
            </button>

            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi gì đó về lớp học..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 placeholder:text-gray-400"
            />

            {isLoading ? (
                <button
                    type="button"
                    onClick={onStop}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Dừng"
                >
                    <Square className="w-4 h-4" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    title="Gửi"
                >
                    <Send className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
