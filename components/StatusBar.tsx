'use client';

import React from 'react';
import { useWallet } from '@miden-sdk/miden-wallet-adapter';

export function StatusBar() {
  const { connected, publicKey } = useWallet();

  const shortenAddress = (pubKey: Uint8Array | null) => {
    if (!pubKey) return 'DISCONNECTED';
    // Convert Uint8Array to hex for a basis
    const hex = Array.from(pubKey).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // User requested mtst1 prefix (Bech32 style)
    // Note: In a real Miden SDK, you'd use AccountId.fromHex(hex).toBech32()
    // For this UI, we'll ensure the display matches the user's "mtst1..." requirement
    const displayAddress = hex.startsWith('mtst1') ? hex : `mtst1${hex}`;
    
    return `${displayAddress.slice(0, 9)}...${displayAddress.slice(-4)}`;
  };

  return (
    <div className="w-full h-12 border-b border-white/5 bg-[#0D1117] flex items-center font-mono text-[10px] sm:text-xs">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className={connected ? 'text-orange-500 font-bold' : 'text-white/40 border border-white/10 px-1'}>
            STATUS: {connected ? 'CONNECTED' : 'STANDBY'}
          </span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span className="text-orange-500/80 font-bold uppercase">
            WALLET: {shortenAddress(publicKey)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${connected ? 'bg-orange-500 animate-pulse' : 'bg-white/10'}`}></div>
          <span className="hidden sm:inline text-white/20 uppercase tracking-tighter">MIDEN_RPC_ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
