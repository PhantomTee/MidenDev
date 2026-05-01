'use client';

import React, { useMemo } from 'react';
import {
  WalletProvider,
  MidenWalletAdapter,
} from '@miden-sdk/miden-wallet-adapter';
import { WalletModalProvider } from '@miden-sdk/miden-wallet-adapter-reactui';
import { WalletAdapterNetwork } from '@miden-sdk/miden-wallet-adapter-base';

// Import the adapter CSS for standard styling
import '@miden-sdk/miden-wallet-adapter-reactui/dist/styles.css';

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // You can set the network desired
  const network = WalletAdapterNetwork.Testnet;

  // Initialize the specific wallet adapters you want to support
  const wallets = useMemo(
    () => [
      new MidenWalletAdapter({ appName: 'MidenDev Terminal' }),
    ],
    []
  );

  return (
    <WalletProvider 
      wallets={wallets} 
      autoConnect={false}
      onError={(error) => {
        console.error("WalletProvider Error:", error);
        alert(`Wallet Error: ${error.message || error.name}`);
      }}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}
