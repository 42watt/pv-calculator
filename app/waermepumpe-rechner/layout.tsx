import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/waermepumpe-rechner';

export const metadata: Metadata = {
  title: 'Wärmepumpen-Amortisationsrechner – Kosten vs. Gas, Öl & Co.',
  description:
    'Vergleiche die Kosten einer Wärmepumpe mit Gas, Öl, Nachtspeicher oder Fernwärme. Amortisation, Betriebskosten und CO₂-Einsparung berechnen – kostenlos.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Wärmepumpen-Amortisationsrechner – Kosten vs. Gas, Öl & Co.',
    description: 'Vergleiche Wärmepumpe vs. Gas, Öl, Nachtspeicher oder Fernwärme. Amortisation berechnen.',
    url: pageUrl,
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Wärmepumpen-Amortisationsrechner',
  url: pageUrl,
  description:
    'Kostenloser Amortisationsrechner für Luft-Wasser-Wärmepumpen. Vergleiche Betriebskosten mit Gas, Öl, Nachtspeicher und Fernwärme auf Basis aktueller BDEW- und Fraunhofer-ISE-Daten.',
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
  datePublished: '2025-03-22',
  dateModified: '2025-03-22',
  keywords: [
    'Wärmepumpe',
    'Amortisation',
    'Kostenvergleich',
    'Gasheizung',
    'Ölheizung',
    'Nachtspeicher',
    'Fernwärme',
    'Betriebskosten',
  ],
};

export default function WpRechnerLayout({ children }: { children: React.ReactNode }) {
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
