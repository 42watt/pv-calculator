import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/pv-rechner';

export const metadata: Metadata = {
  title: 'PV & Wärmepumpe Rechner 2026 – Gesamtsystem-Wirtschaftlichkeit',
  description:
    'Wirtschaftlichkeit von Photovoltaik mit Wärmepumpe, Batteriespeicher und E-Auto berechnen. Eigenverbrauch, Autarkie, CO₂-Ersparnis und Amortisation auf einen Blick.',
  keywords: [
    'PV Wärmepumpe Rechner',
    'Photovoltaik Wärmepumpe',
    'Gesamtsystem PV',
    'Eigenverbrauch Wärmepumpe',
    'Autarkie berechnen',
    'PV Speicher E-Auto',
    'PV Wirtschaftlichkeitsrechner',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: pageUrl,
    siteName: '42watt Tools',
    title: 'PV & Wärmepumpe Rechner – Gesamtsystem-Wirtschaftlichkeit',
    description: 'Berechne Eigenverbrauch, Autarkie und Amortisation deiner PV-Anlage mit Wärmepumpe.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PV & Wärmepumpe Rechner – Wirtschaftlichkeit',
    description: 'Eigenverbrauch, Autarkie & Amortisation berechnen.',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${pageUrl}#software`,
  name: 'PV & Wärmepumpe Rechner',
  alternateName: ['PV-Gesamtsystem-Rechner', 'Photovoltaik-Wärmepumpe-Rechner'],
  url: pageUrl,
  description:
    'Online-Rechner für die Wirtschaftlichkeit von Photovoltaik im Verbund mit Wärmepumpe, Batteriespeicher und E-Auto. Berechnet Eigenverbrauchsanteil, Autarkiegrad, CO₂-Ersparnis sowie Amortisationsdauer.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  datePublished: '2025-01-01',
  dateModified: '2026-04-17',
  featureList: [
    'PV + Wärmepumpe + Speicher + E-Auto',
    'Eigenverbrauchsanteil berechnen',
    'Autarkiegrad bestimmen',
    'CO₂-Ersparnis',
    'Amortisationsdauer',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://tools.42watt.de' },
    { '@type': 'ListItem', position: 2, name: 'PV & Wärmepumpe Rechner', item: pageUrl },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wie viel Strom verbraucht ein Haushalt mit Wärmepumpe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zusätzlich zum Haushaltsstrom (ca. 4.500 kWh/Jahr für 4 Personen) kommen bei einer Wärmepumpe rund 4.000–6.000 kWh hinzu. Ein E-Auto mit 15.000 km Fahrleistung verbraucht weitere ca. 2.700 kWh. Der Gesamtverbrauch liegt dann bei 11.000–14.000 kWh pro Jahr.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welche PV-Größe brauche ich mit einer Wärmepumpe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Für einen Haushalt mit Wärmepumpe empfehlen sich 10–15 kWp Photovoltaikleistung. Eine Faustregel: PV-Anlage in kWp ≈ Stromverbrauch in MWh × 1,2. Ein Speicher von 10–15 kWh erhöht den Eigenverbrauchsanteil deutlich.',
      },
    },
    {
      '@type': 'Question',
      name: 'Lohnt sich PV besonders bei Wärmepumpe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja – weil eine Wärmepumpe den Stromverbrauch stark erhöht, lohnt sich PV noch stärker. Jede selbst verbrauchte Kilowattstunde spart ~34 Cent, während die Einspeisevergütung nur ~8 Cent beträgt. Die Amortisation verkürzt sich typisch um 2–4 Jahre gegenüber einem Haushalt ohne Wärmepumpe.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie hoch ist der Eigenverbrauchsanteil bei PV + Wärmepumpe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ohne Speicher liegt der Eigenverbrauchsanteil bei 30–40 %. Mit Batteriespeicher (10 kWh) und Wärmepumpe sind 55–70 % realistisch. Ein Energiemanagementsystem, das Wärmepumpe und Wallbox lastabhängig steuert, erhöht den Wert zusätzlich um 5–10 Prozentpunkte.',
      },
    },
  ],
};

export default function PvRechnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([softwareSchema, breadcrumbSchema, faqSchema]),
        }}
      />
      {children}
    </>
  );
}
