import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Dev Island — Your code, a world of its own', description: 'Explore a playable island made from your GitHub projects.' };
export default function Layout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html> }
