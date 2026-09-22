import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Sovereign Data Exchange Protocol (SDEP)',
  description: 'Inter-Ministerial Zero-Knowledge Verification Platform for Sovereign Data Exchange.',
  openGraph: {
    title: 'Sovereign Data Exchange Protocol (SDEP)',
    description: 'Inter-Ministerial Zero-Knowledge Verification Platform for Sovereign Data Exchange.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sovereign Data Exchange Protocol (SDEP)',
    description: 'Inter-Ministerial Zero-Knowledge Verification Platform for Sovereign Data Exchange.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
