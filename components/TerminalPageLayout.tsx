'use client';

import React from 'react';
import { StatusBar } from '@/components/StatusBar';

interface TerminalPageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function TerminalPageLayout({ children, title }: TerminalPageLayoutProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto font-mono text-orange-500">
          <header className="mb-12 border-l-4 border-orange-500 pl-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              {title}
            </h1>
            <p className="text-[10px] text-orange-500/60 uppercase tracking-[0.2em] mt-1">
              Miden OS Subprocess: {title.replace(/\s+/g, '_')}
            </p>
          </header>

          <div className="border border-orange-500 p-6 sm:p-10 bg-black/40">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
