import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/pv-investition';

export const metadata: Metadata = {
  title: 'PV-Investitionsrechner – Photovoltaik-Rendite berechnen',
  description:
    'Bewerte deine Photovoltaik-Investition: Break-Even, Rendite, Nettogewinn und Strompreisentwicklung. Kostenloser Rechner mit aktuellen Daten 2025.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'PV-Investitionsrechner – Photovoltaik-Rendite berechnen',
    description: 'Bewerte deine Photovoltaik-Investition: Break-Even, Rendite und Nettogewinn.',
    url: pageUrl,
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PV-Investitionsrechner',
  url: pageUrl,
  description:
    'Online-Rechner zur Bewertung von Photovoltaik-Investitionen. Berechne Break-Even, Gesamtrendite, jährliche Rendite und Nettogewinn über den Betrachtungszeitraum.',
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

export default function PvInvestitionLayout({ children }: { children: React.ReactNode }) {
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
