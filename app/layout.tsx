import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ClientProviders } from './ClientProviders';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-[#0A0A0B] text-orange-500 overflow-x-hidden min-h-screen">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
