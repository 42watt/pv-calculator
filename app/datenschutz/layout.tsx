import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung der Enovato GmbH (42watt) – Informationen zur Verarbeitung personenbezogener Daten.',
  alternates: { canonical: 'https://tools.42watt.de/datenschutz' },
  robots: { index: true, follow: true },
};

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
