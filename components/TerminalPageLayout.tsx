'use client';

import React from 'react';
import Link from 'next/link';
import { StatusBar } from '@/components/StatusBar';

interface TerminalPageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function TerminalPageLayout({ children, title }: TerminalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0D1117] font-mono text-orange-500 selection:bg-orange-500 selection:text-black">
      <StatusBar />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <nav className="mb-8">
          <Link 
            href="/"
            className="inline-block border border-orange-500 px-4 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-colors rounded-none"
          >
            [ cd ~ / Return Home ]
          </Link>
        </nav>

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
  );
}
