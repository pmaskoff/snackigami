import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Snackigami',
  description: 'Discover unique snack combinations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="container" style={{ paddingBottom: '80px' }}>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
