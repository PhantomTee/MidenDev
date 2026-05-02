'use client';

import React from 'react';
import TerminalUI from '@/components/Terminal';
import ConnectWalletDynamic from '@/components/ConnectWalletDynamic';
import { useWallet } from '@miden-sdk/miden-wallet-adapter';
import { StatusBar } from '@/components/StatusBar';

export default function TerminalPage() {
  const { connected } = useWallet();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StatusBar />
      <div className="flex-1 overflow-hidden">
        {!connected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-orange-500 bg-[#07090D]">
          <div className="max-w-md w-full border border-orange-500 p-8 bg-orange-500/5 text-center">
            <h1 className="text-4xl font-black italic tracking-tighter mb-4 uppercase text-orange-500">MIDEN_DEV</h1>
            <div className="h-[2px] w-full bg-orange-500 mb-8 opacity-30"></div>
            <p className="text-sm tracking-widest mb-8 uppercase text-orange-500/60">
              &gt; AUTHENTICATION_REQUIRED_FOR_SERIAL_ACCESS
            </p>
            <div className="inline-block transform scale-110">
              <ConnectWalletDynamic />
            </div>
          </div>
          <div className="mt-12 text-[10px] uppercase tracking-[0.3em] opacity-40">
            SECURE_SHELL_ESTABLISHED // PORT_57211
          </div>
        </div>
      ) : (
        <TerminalUI />
      )}
      </div>
    </div>
  );
}
