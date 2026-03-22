import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/pv-rechner';

export const metadata: Metadata = {
  title: 'PV & Wärmepumpe Rechner – Wirtschaftlichkeit berechnen',
  description:
    'Berechne die Wirtschaftlichkeit von Photovoltaik mit Wärmepumpe, Speicher und E-Auto. Eigenverbrauch, Autarkie und Amortisation auf einen Blick.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'PV & Wärmepumpe Rechner – Wirtschaftlichkeit berechnen',
    description: 'Berechne Eigenverbrauch, Autarkie und Amortisation deiner PV-Anlage mit Wärmepumpe.',
    url: pageUrl,
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PV & Wärmepumpe Rechner',
  url: pageUrl,
  description:
    'Online-Rechner für die Wirtschaftlichkeit von Photovoltaik mit Wärmepumpe. Berechne Eigenverbrauch, Autarkiegrad, CO₂-Ersparnis und Amortisation.',
  applicationCategory: 'UtilitiesApplication',
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

export default function PvRechnerLayout({ children }: { children: React.ReactNode }) {
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
