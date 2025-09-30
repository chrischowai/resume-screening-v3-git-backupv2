import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  const bgColor = type === 'success' ? 'bg-success' : 'bg-destructive';
  const textColor = type === 'success' ? 'text-success-foreground' : 'text-destructive-foreground';

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        ${bgColor} ${textColor} animate-in slide-in-from-top-2 duration-300
      `}
      role="status"
      aria-live="polite"
      tabIndex={-1}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="font-medium">{message}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className={`h-6 w-6 p-0 ${textColor} hover:bg-white/20`}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};