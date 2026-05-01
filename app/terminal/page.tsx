import TerminalUI from '@/components/Terminal';
import ConnectWalletDynamic from '@/components/ConnectWalletDynamic';
import { ClientProviders } from '@/app/ClientProviders';

export default function TerminalPage() {
  return (
    <ClientProviders>
      <main className="h-[100dvh] w-full bg-[#0A0A0B] sm:p-2 sm:bg-black overflow-hidden flex flex-col">
        <div className="flex-1 w-full max-w-[1440px] mx-auto bg-[#0A0A0B] sm:border-4 sm:border-[#1A1A1C] shadow-2xl flex flex-col overflow-hidden relative">
          <ConnectWalletDynamic>
            <TerminalUI />
          </ConnectWalletDynamic>
        </div>
      </main>
    </ClientProviders>
  );
}
