'use client'

import { Toaster as SonnerToaster } from 'sonner';

export function ToastProvider({ ...props }: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      position="top-center"
      duration={2000}
      closeButton={true}
      richColors={true}
      {...props}
    />
  );
}

export function ToastViewport() {
  return null; // Sonner handles its own viewport
}

// Export Sonner's toast function for direct use
export { toast } from 'sonner'; 