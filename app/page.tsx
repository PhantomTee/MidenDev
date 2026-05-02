'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@miden-sdk/miden-wallet-adapter';
import { 
  Rocket, 
  Terminal as TerminalIcon, 
  Zap, 
  ArrowRight,
  Shield,
  Cpu,
  Code2
} from 'lucide-react';

const CodePreview = ({ code, title }: { code: string; title: string }) => (
  <div className="border border-orange-500/20 bg-black/40 rounded-none overflow-hidden font-mono text-[10px]">
    <div className="bg-orange-500/10 px-3 py-1 border-b border-orange-500/20 flex justify-between items-center">
      <span className="text-orange-500/60 uppercase tracking-widest">{title}</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/20" />
      </div>
    </div>
    <pre className="p-4 text-orange-500/80 leading-relaxed overflow-x-auto">
      {code}
    </pre>
  </div>
);

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-[#0D1117] font-mono selection:bg-orange-500/30">
      {/* Header (Matching Screenshot) */}
      <header className="flex items-center justify-between px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 font-black text-xl tracking-tighter">&gt;_</span>
          <span className="text-white font-black tracking-widest text-sm">MIDEN.DEV</span>
        </div>
        <Link 
          href="/terminal" 
          className="border border-orange-500 text-orange-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all"
        >
          Launch Terminal
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full">
        <h1 className="text-4xl sm:text-7xl font-bold leading-tight mb-8">
          <span className="text-white">Build on Miden,</span><br />
          <span className="text-orange-500">Without Leaving<br />the Terminal.</span>
        </h1>

        {/* Terminal Mockup */}
        <div className="w-full max-w-2xl border border-white/10 rounded-lg overflow-hidden bg-[#161B22] shadow-2xl mb-12">
          <div className="bg-[#0D1117] px-4 py-2 flex items-center gap-2 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="flex-1 text-center text-[10px] text-white/40 tracking-wider">
              bash — miden-client
            </div>
          </div>
          <div className="p-8 text-left text-sm sm:text-base">
            <div className="flex items-center gap-3">
              <span className="text-orange-500/60 font-bold">~</span>
              <span className="text-orange-500 font-bold">&gt;</span>
              <span className="text-white">miden-client tx new</span>
              <span className="w-2.5 h-5 bg-orange-500 animate-pulse ml-1" />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link 
          href="/terminal"
          className="bg-orange-500 text-black px-10 py-4 font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-white transition-colors group mb-32"
        >
          Start Building
          <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </Link>

        {/* Feature Grid with Code Previews */}
        <div className="w-full max-w-6xl space-y-24 mb-32">
          {/* Module 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-3 px-3 py-1 border border-orange-500/20 text-[10px] font-bold text-orange-500/60 tracking-[0.3em] uppercase">
                <TerminalIcon size={14} /> MODULE_01 // CORE_TERMINAL
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic">AI Architect</h2>
              <p className="text-white/60 leading-relaxed uppercase text-sm">
                Interact with the Miden AI agent to architect complex ZK-circuits and account logic via natural language commands.
              </p>
              <Link href="/terminal" className="inline-flex items-center gap-2 text-orange-500 font-bold hover:underline">
                OPEN_TERMINAL <ArrowRight size={16} />
              </Link>
            </div>
            <CodePreview 
              title="terminal_session.sh"
              code={`> miden-client compile account.masm
> miden-client deploy --rpc=devnet
[SYSTEM] Deployment Successful
[INFO] Account ID: 0xFA57...`}
            />
          </div>

          {/* Module 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
            <div className="lg:order-last">
              <CodePreview 
                title="p2id_note.masm"
                code={`begin
  # Authenticated unlock
  exec.account::get_id
  push.receiver_id
  assert_eq
  # Asset transfer
  exec.vault::transfer
end`}
              />
            </div>
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-3 px-3 py-1 border border-orange-500/20 text-[10px] font-bold text-orange-500/60 tracking-[0.3em] uppercase">
                <Rocket size={14} /> MODULE_02 // NOTE_CRAFTER
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic">Note Generator</h2>
              <p className="text-white/60 leading-relaxed uppercase text-sm">
                Construct high-performance P2ID notes with sub-second proving times for cross-account execution.
              </p>
              <Link href="/craft-note" className="inline-flex items-center gap-2 text-orange-500 font-bold hover:underline">
                CRAFT_NEW_NOTE <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Module 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-3 px-3 py-1 border border-orange-500/20 text-[10px] font-bold text-orange-500/60 tracking-[0.3em] uppercase">
                <Zap size={14} /> MODULE_03 // FAUCET_LAUNCHER
              </div>
              <h2 className="text-3xl font-black text-white uppercase italic">Token Engine</h2>
              <p className="text-white/60 leading-relaxed uppercase text-sm">
                Deploy standard fungible faucets with MASM templates. Initialize token supply on the Miden VM instantly.
              </p>
              <Link href="/deploy-faucet" className="inline-flex items-center gap-2 text-orange-500 font-bold hover:underline">
                LAUNCH_FAUCET <ArrowRight size={16} />
              </Link>
            </div>
            <CodePreview 
              title="faucet_logic.masm"
              code={`export.mint_faucet
  # Mint new tokens
  push.1.0.0.0
  exec.faucet::mint
  # Push to vault
  exec.account::add_asset
end`}
            />
          </div>
        </div>

        {/* System Stats Footer Area */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full border-t border-white/5 pt-16 mb-24 text-[10px] uppercase font-bold tracking-widest text-white/20">
          <div className="space-y-2">
            <div className="text-orange-500/40">Network Load</div>
            <div className="flex gap-1 h-3 items-end">
              <div className="w-1 h-2 bg-orange-500/40" />
              <div className="w-1 h-3 bg-orange-500/40" />
              <div className="w-1 h-1 bg-orange-500/40" />
              <div className="w-1 h-2 bg-orange-500/40" />
            </div>
          </div>
          <div className="space-y-2 text-left">
            <div className="text-orange-500/40">Active Proofs</div>
            <div className="text-orange-500/60">14,211 / SEC</div>
          </div>
          <div className="space-y-2 text-left">
            <div className="text-orange-500/40">Uptime</div>
            <div className="text-orange-500/60">99.999% ONLINE</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-orange-500/40">Sync State</div>
            <div className="text-orange-500/60">LATEST_BLOCK: #512,982</div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-[10px] text-white/20 uppercase tracking-[0.5em]">
        POLYGON_MIDEN_LABS // END_USER_INTERFACE
      </footer>
    </div>
  );
}

