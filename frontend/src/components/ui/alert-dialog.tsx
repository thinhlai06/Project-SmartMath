import * as React from 'react';

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

interface AlertDialogContentProps {
    children: React.ReactNode;
    className?: string;
}

interface AlertDialogFooterProps {
    children: React.ReactNode;
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'default' | 'destructive';
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="alertdialog"
            aria-modal="true"
        >
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-10 w-full max-w-md">{children}</div>
        </div>
    );
}

export function AlertDialogContent({ children, className = '' }: AlertDialogContentProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-2xl p-6 mx-4 border border-slate-200 ${className}`}>
            {children}
        </div>
    );
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
    return <div className="mb-4">{children}</div>;
}

export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-bold text-slate-900 mb-1">{children}</h2>;
}

export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-slate-600 leading-relaxed">{children}</p>;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
    return <div className="flex items-center justify-end gap-3 mt-6">{children}</div>;
}

export function AlertDialogAction({ children, variant = 'default', className = '', ...props }: AlertDialogActionProps) {
    const baseClass = 'px-4 py-2 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClass =
        variant === 'destructive'
            ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';

    return (
        <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
}

export function AlertDialogCancel({ children, className = '', ...props }: AlertDialogCancelProps) {
    return (
        <button
            className={`px-4 py-2 rounded-xl font-semibold text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
