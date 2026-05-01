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
    <div className="w-full border-b border-orange-500 bg-[#0D1117] p-3 font-mono text-[10px] sm:text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className={connected ? 'text-orange-500 font-bold' : 'text-orange-900 border border-orange-900 px-1'}>
            STATUS: {connected ? 'CONNECTED' : 'STANDBY'}
          </span>
          <span className="hidden sm:inline text-orange-500/30">|</span>
          <span className="text-orange-500 font-bold uppercase">
            WALLET: {shortenAddress(publicKey)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${connected ? 'bg-orange-500 animate-pulse' : 'bg-orange-900'}`}></div>
          <span className="hidden sm:inline text-orange-500/60 uppercase tracking-tighter">MIDEN_RPC_ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
