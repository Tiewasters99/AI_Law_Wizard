'use client'

import { Toaster } from 'sonner';

export function ToasterComponent() {
  return (
    <Toaster
      position="top-center"
      duration={2000}
      closeButton={true}
      richColors={true}
    />
  );
} 