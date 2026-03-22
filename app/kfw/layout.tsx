import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/kfw';

export const metadata: Metadata = {
  title: 'KfW Förderrechner 2025 – Wärmepumpen-Förderung berechnen',
  description:
    'Berechne deine KfW-Förderung für Wärmepumpen: Grundförderung, Klimabonus, Einkommensbonus & Effizienzbonus. Bis zu 70 % Zuschuss – kostenlos & aktuell.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'KfW Förderrechner 2025 – Wärmepumpen-Förderung berechnen',
    description: 'Berechne deine KfW-Förderung für Wärmepumpen: Bis zu 70 % Zuschuss.',
    url: pageUrl,
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KfW Förderrechner',
  url: pageUrl,
  description:
    'Kostenloser Online-Rechner zur Berechnung der KfW-Förderung für Wärmepumpen. Grundförderung, Klimabonus, Einkommensbonus und Effizienzbonus auf einen Blick.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  datePublished: '2025-01-01',
  dateModified: '2025-03-22',
};

export default function KfwLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
