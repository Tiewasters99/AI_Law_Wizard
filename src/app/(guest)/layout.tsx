"use client";

import { GuestHeader } from "./components/GuestHeader";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GuestHeader />
      {/* Main Content */}
      <main className="pt-16">{children}</main>
    </>
  );
}
