'use client';

import { useWallet, WalletMultiButton } from '@miden-sdk/miden-wallet-adapter';

export default function ConnectWallet({ children }: { children?: React.ReactNode }) {
  const { connected, publicKey } = useWallet();

  // 1. Success State (Metal Connected)
  if (connected) {
    return (
      <div className="bg-[#0D1117] min-h-full flex flex-col font-mono text-orange-500">
        <div className="p-4 border-b border-orange-500/30">
          <p className="font-bold tracking-widest text-sm">
            &gt; Connected to Miden Wallet: {publicKey ? Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('') : "Unknown"}
          </p>
        </div>
        <div className="flex-1 relative">
          {children}
        </div>
      </div>
    );
  }

  // 2. Connection Prompt
  return (
    <div className="bg-[#0D1117] text-orange-500 font-mono p-4 min-h-full flex flex-col items-center justify-center">
      <div className="border border-orange-500 p-8 max-w-md w-full select-none shadow-[0_0_20px_rgba(255,85,0,0.15)] flex flex-col items-center gap-8">
        <div className="w-full">
          <h1 className="text-xl font-bold tracking-widest text-center shadow-text-orange">MidenDev Terminal v2.0</h1>
          <p className="text-orange-800 text-center uppercase tracking-widest mt-2 text-xs">Wallet Adapter Environment</p>
        </div>

        <div className="w-full flex justify-center">
          <WalletMultiButton className="!bg-[#FF5500] hover:!bg-orange-600 transition-colors !rounded-none" />
        </div>
      </div>
    </div>
  );
}
