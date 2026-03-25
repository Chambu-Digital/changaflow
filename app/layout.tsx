// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import InstallPWA from '@/components/ui/InstallPWA';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ff6b0a',
};

export const metadata: Metadata = {
  title: 'FundMi — Raise Money Together, Kenya',
  description: 'The fastest way for Kenyans to raise money via M-Pesa. Create a fundraiser in under 2 minutes.',
  keywords: 'fundraising kenya, mpesa fundraiser, FundMi, crowdfunding kenya',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FundMi',
  },
  openGraph: {
    title: 'FundMi — Raise Money Together',
    description: 'Create a fundraiser and collect donations via M-Pesa instantly.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="font-body bg-[#FDFAF6] text-[#1a1208] antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontFamily: 'var(--font-body)', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#2d6a4f', secondary: '#fff' } },
          }}
        />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        {/* Mobile install banner */}
        <InstallPWA variant="banner" />
      </body>
    </html>
  );
}
