
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MediRoute - Emergency Navigator',
  description: 'Find the fastest route to medical help in an emergency.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: The SOS button state (location) might be better managed
  // via context if needed across many deeply nested components.
  // For this structure, passing location down or fetching it where needed is acceptable.

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen bg-background text-foreground">
           {children}
        </main>
        <Toaster /> {/* Add Toaster for notifications */}
        {/* SOS button is now rendered conditionally within pages that provide location */}
      </body>
    </html>
  );
}
