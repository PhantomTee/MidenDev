'use client';

import React from 'react';
import TerminalUI from '@/components/Terminal';
import ConnectWalletDynamic from '@/components/ConnectWalletDynamic';
import { useWallet } from '@miden-sdk/miden-wallet-adapter';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="h-screen bg-[#0A0A0B] flex flex-col font-mono selection:bg-orange-500 selection:text-black">
      {!connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-orange-500">
          <div className="max-w-md w-full border border-orange-500 p-8 bg-orange-500/5 text-center">
            <h1 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">MIDEN_DEV</h1>
            <div className="h-[2px] w-full bg-orange-500 mb-8 opacity-30"></div>
            <p className="text-sm tracking-widest mb-8 uppercase text-orange-500/60">
              &gt; CRYPTOGRAPHIC_AUTHENTICATION_REQUIRED
            </p>
            <div className="inline-block transform scale-110">
              <ConnectWalletDynamic />
            </div>
          </div>
          <div className="mt-12 text-[10px] uppercase tracking-[0.3em] opacity-40">
            Polygon Miden Network // Terminal v0.14.5
          </div>
        </div>
      ) : (
        <TerminalUI />
      )}
    </main>
  );
}
