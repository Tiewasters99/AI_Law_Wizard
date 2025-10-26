"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastComponent({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-green-50 border-green-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg pointer-events-auto`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <p className="text-sm font-medium text-slate-900">
                {toast.title}
              </p>
            )}
            {toast.description && (
              <p className="mt-1 text-sm text-slate-500">{toast.description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onRemove(toast.id), 300);
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose addToast globally
  useEffect(() => {
    (window as any).toast = {
      success: (title: string, description?: string) =>
        addToast({ title, description, type: "success" }),
      error: (title: string, description?: string) =>
        addToast({ title, description, type: "error" }),
      warning: (title: string, description?: string) =>
        addToast({ title, description, type: "warning" }),
      info: (title: string, description?: string) =>
        addToast({ title, description, type: "info" }),
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Simple toast function for compatibility
export const toast = {
  success: (message: string) => {
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast.success(message);
    }
  },
  error: (message: string) => {
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast.error(message);
    }
  },
  warning: (message: string) => {
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast.warning(message);
    }
  },
  info: (message: string) => {
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast.info(message);
    }
  },
};
