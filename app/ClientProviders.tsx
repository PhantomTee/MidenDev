'use client';

import dynamic from 'next/dynamic';

const NoSSRProviders = dynamic(
  () => import('./providers').then(mod => mod.Providers),
  { ssr: false }
);

const DynamicWalletContextProvider = dynamic(
  () => import('@/components/WalletContextProvider').then(mod => mod.WalletContextProvider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <DynamicWalletContextProvider>
      <NoSSRProviders>{children}</NoSSRProviders>
    </DynamicWalletContextProvider>
  );
}
