'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Terminal as TerminalIcon, 
  PlusSquare, 
  Coins, 
  Activity 
} from 'lucide-react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Terminal', href: '/terminal', icon: TerminalIcon },
    { name: 'Note Crafter', href: '/craft-note', icon: PlusSquare },
    { name: 'Faucet Launcher', href: '/deploy-faucet', icon: Coins },
    { name: 'Node Status', href: '/node-status', icon: Activity },
  ];

  return (
    <aside 
      className={`relative h-screen transition-all duration-300 border-r border-white/5 bg-[#0D1117] flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 border-b border-white/5 text-orange-500 hover:bg-orange-500 hover:text-black transition-colors flex items-center justify-center h-12"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest"><ChevronLeft size={18} /> COLLAPSE_OS</div>}
      </button>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-3 transition-all group relative ${
                  isActive 
                    ? 'bg-orange-500 text-black font-bold' 
                    : 'text-orange-500/60 hover:text-orange-500 hover:bg-orange-500/5'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && (
                  <span className="text-xs uppercase font-mono tracking-widest truncate">
                    {item.name}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-0 w-1 h-full bg-black/20" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
