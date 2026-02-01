import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ITraders Store | Premium Electronics in Kenya',
  description: 'Your trusted destination for authentic Apple, Samsung, and premium electronics in Kenya. Shop iPhones, MacBooks, iPads, Apple Watches, and more with warranty.',
  keywords: 'iPhone Kenya, MacBook Kenya, iPad Kenya, Apple Watch Kenya, Samsung Kenya, Electronics Kenya, ITraders Store',
  openGraph: {
    title: 'ITraders Store | Premium Electronics in Kenya',
    description: 'Your trusted destination for authentic Apple, Samsung, and premium electronics in Kenya.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-[104px] lg:pt-[120px]">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1A1A1A',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#7C3AED',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
