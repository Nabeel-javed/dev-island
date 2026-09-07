import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3100'),
  ),
  openGraph: {
    type: 'website',
    siteName: 'Dev Island',
    images: [
      {
        url: '/social/dev-island-3d-v3.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Dev Island — Your GitHub, with room to explore. A miniature 3D island with six project buildings.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: '/social/dev-island-3d-v3.jpg',
        alt: 'Dev Island — Your GitHub, with room to explore.',
      },
    ],
  },
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
