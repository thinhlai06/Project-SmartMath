import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ChatPanel } from './ChatPanel';

export function ChatFloatingButton() {
    const [isOpen, setIsOpen] = useState(false);
    const params = useParams<{ classId?: string }>();
    const classId = params.classId ? Number(params.classId) : undefined;

    return (
        <>
            <ChatPanel
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                classId={classId}
            />

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center print:hidden"
                title="Trợ lý AI"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-6 h-6" />
                )}
            </button>
        </>
    );
}
