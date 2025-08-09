"use client";

import { ClerkProvider } from '@clerk/nextjs';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
} 