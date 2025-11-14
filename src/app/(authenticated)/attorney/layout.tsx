"use client";

interface AttorneyLayoutProps {
  children: React.ReactNode;
}

export default function AttorneyLayout({ children }: AttorneyLayoutProps) {
  // Layout is already applied in authenticated/layout.tsx
  // This file just passes through children to avoid nested layouts
  return <>{children}</>;
}
