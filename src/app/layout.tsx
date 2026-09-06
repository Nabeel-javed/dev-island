import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3100'),
  openGraph: { images: ['/api/og'] },
  twitter: { card: 'summary_large_image', images: ['/api/og'] },
  title: 'Dev Island — Your code, a world of its own',
  description: 'Explore a playable island made from your GitHub projects.',
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
