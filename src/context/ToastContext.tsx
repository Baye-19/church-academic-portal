import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  duration?: number; // ms, default 4000
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  description?: string;
  duration: number;
  createdAt: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, options?: ToastOptions | number) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (message: string, options?: ToastOptions | string) => string;
  error: (message: string, options?: ToastOptions | string) => string;
  warning: (message: string, options?: ToastOptions | string) => string;
  info: (message: string, options?: ToastOptions | string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 4000;

interface SingleToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const SingleToastCard: React.FC<SingleToastCardProps> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toast.duration <= 0) return;

    let animFrame: number;
    const startProgress = () => {
      const update = () => {
        if (!isPaused) {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, remainingTimeRef.current - elapsed);
          const percent = (remaining / toast.duration) * 100;
          setProgress(percent);

          if (remaining <= 0) {
            onDismiss(toast.id);
            return;
          }
        }
        animFrame = requestAnimationFrame(update);
      };
      animFrame = requestAnimationFrame(update);
    };

    startProgress();

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  // Visual styling variants
  const getTheme = () => {
    switch (toast.type) {
      case 'success':
        return {
          cardBg: 'bg-[#1D120B] border-[#10B981]/50 shadow-emerald-950/40',
          iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
          progressBar: 'bg-gradient-to-r from-emerald-500 to-[#F5A623]',
          badgeText: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/10',
          Icon: CheckCircle2,
          defaultTitle: 'Success',
        };
      case 'error':
        return {
          cardBg: 'bg-[#1F0E0D] border-rose-500/50 shadow-rose-950/40',
          iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
          progressBar: 'bg-rose-500',
          badgeText: 'text-rose-400',
          badgeBg: 'bg-rose-500/10',
          Icon: AlertCircle,
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          cardBg: 'bg-[#1E1408] border-amber-500/50 shadow-amber-950/40',
          iconBg: 'bg-amber-500/15 text-[#F5A623] border border-amber-500/30',
          progressBar: 'bg-[#F5A623]',
          badgeText: 'text-amber-400',
          badgeBg: 'bg-amber-500/10',
          Icon: AlertTriangle,
          defaultTitle: 'Warning',
        };
      case 'info':
      default:
        return {
          cardBg: 'bg-[#14151F] border-sky-500/40 shadow-sky-950/40',
          iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
          progressBar: 'bg-sky-500',
          badgeText: 'text-sky-400',
          badgeBg: 'bg-sky-500/10',
          Icon: Info,
          defaultTitle: 'Notice',
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.Icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative w-full sm:w-96 rounded-2xl border ${theme.cardBg} shadow-2xl p-4 transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-[1.02] flex flex-col justify-between overflow-hidden backdrop-blur-md pointer-events-auto`}
    >
      {/* Glow decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3 relative z-10">
        <div className={`p-2.5 rounded-xl ${theme.iconBg} flex-shrink-0 shadow-inner mt-0.5`}>
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-xs font-bold text-white tracking-wide">
              {toast.title || theme.defaultTitle}
            </h4>
            <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${theme.badgeBg} ${theme.badgeText}`}>
              {toast.type}
            </span>
          </div>

          <p className="text-xs text-[#E8D7C5] font-medium leading-relaxed break-words">
            {toast.message}
          </p>

          {toast.description && (
            <p className="text-[11px] text-[#A68F7B] mt-1 leading-normal">
              {toast.description}
            </p>
          )}

          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="text-xs font-bold px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition flex items-center gap-1.5 shadow-sm"
              >
                <span>{toast.action.label}</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-[#A68F7B] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar at bottom */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div
            className={`h-full ${theme.progressBar} transition-all ease-linear`}
            style={{ width: `${progress}%`, transitionDuration: isPaused ? '0ms' : '50ms' }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions | number): string => {
      const id = typeof options === 'object' && options?.id ? options.id : `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const duration = typeof options === 'number' ? options : options?.duration !== undefined ? options.duration : DEFAULT_DURATION;
      const title = typeof options === 'object' ? options?.title : undefined;
      const description = typeof options === 'object' ? options?.description : undefined;
      const action = typeof options === 'object' ? options?.action : undefined;

      const newToast: ToastItem = {
        id,
        type,
        message,
        title,
        description,
        duration,
        createdAt: Date.now(),
        action,
      };

      setToasts((prev) => {
        // Keep maximum of 5 recent toasts to avoid overcrowding screen
        const filtered = prev.filter((t) => t.id !== id);
        return [newToast, ...filtered].slice(0, 5);
      });

      return id;
    },
    []
  );

  const success = useCallback(
    (message: string, options?: ToastOptions | string) => {
      const opts = typeof options === 'string' ? { title: options } : options;
      return showToast(message, 'success', opts);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions | string) => {
      const opts = typeof options === 'string' ? { title: options } : options;
      return showToast(message, 'error', opts);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions | string) => {
      const opts = typeof options === 'string' ? { title: options } : options;
      return showToast(message, 'warning', opts);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions | string) => {
      const opts = typeof options === 'string' ? { title: options } : options;
      return showToast(message, 'info', opts);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      {/* Floating Viewport Toast Container (Top-Right on desktop, Top-Center on mobile) */}
      <div
        id="toast-notification-viewport"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-3 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-none transition-all duration-300"
      >
        {toasts.map((toast) => (
          <SingleToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
