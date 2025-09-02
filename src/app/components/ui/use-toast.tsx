'use client'

import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

function toast({ title, description, variant = "default", ...props }: ToastProps) {
  if (variant === "destructive") {
    return sonnerToast.error(title || "Error", {
      description,
      duration: 2000,
      ...props,
    });
  }

  return sonnerToast(title || "Success", {
    description,
    duration: 2000,
    ...props,
  });
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    dismissAll: sonnerToast.dismiss,
    remove: sonnerToast.dismiss,
    toasts: [], // Sonner manages its own state
  };
}

export { useToast, toast }; 