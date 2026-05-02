import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ClientProviders } from './ClientProviders';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

import { Sidebar } from '@/components/Sidebar';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-[#0A0A0B] text-orange-500 overflow-hidden min-h-screen flex flex-col">
        <ClientProviders>
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden bg-[#0D1117] relative">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
