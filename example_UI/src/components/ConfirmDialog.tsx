import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'info',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const colors = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-500 hover:bg-red-600',
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const Icon = type === 'danger' ? AlertTriangle : Info;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type].icon}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-white rounded-lg font-medium transition-all ${colors[type].button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
