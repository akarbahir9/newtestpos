import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from "@/components/ui/sonner"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
        <Toaster richColors dir="rtl" />
      </div>
    </div>
  );
}
