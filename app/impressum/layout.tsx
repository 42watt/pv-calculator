import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum der 42watt GmbH – Angaben gemäß § 5 TMG.',
  alternates: { canonical: 'https://tools.42watt.de/impressum' },
  robots: { index: true, follow: true },
};

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
