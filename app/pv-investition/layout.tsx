import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/pv-investition';

export const metadata: Metadata = {
  title: 'PV-Investitionsrechner 2026 – Rendite & Amortisation berechnen',
  description:
    'Lohnt sich deine Photovoltaik-Anlage? Berechne Break-Even, Gesamtrendite, Nettogewinn und Amortisationszeit – inkl. Strompreisentwicklung und Einspeisevergütung 2026.',
  keywords: [
    'PV Investitionsrechner',
    'Photovoltaik Rendite',
    'PV Amortisation',
    'Break-Even Photovoltaik',
    'PV Rendite berechnen',
    'Photovoltaik Wirtschaftlichkeit',
    'Einspeisevergütung 2026',
    'PV Nettogewinn',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: pageUrl,
    siteName: '42watt Tools',
    title: 'PV-Investitionsrechner 2026 – Rendite & Amortisation',
    description: 'Bewerte deine Photovoltaik-Investition: Break-Even, Rendite und Nettogewinn.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PV-Investitionsrechner – Rendite berechnen',
    description: 'Break-Even, Rendite und Nettogewinn deiner PV-Anlage bewerten.',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${pageUrl}#software`,
  name: 'PV-Investitionsrechner',
  alternateName: ['Photovoltaik Renditerechner', 'PV-Amortisationsrechner'],
  url: pageUrl,
  description:
    'Online-Rechner zur Bewertung von Photovoltaik-Investitionen. Berechnet Break-Even-Punkt, Gesamtrendite, jährliche Rendite und Nettogewinn über den Betrachtungszeitraum unter Berücksichtigung von Strompreissteigerung und Einspeisevergütung.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  datePublished: '2025-01-01',
  dateModified: '2026-04-17',
  featureList: [
    'Break-Even berechnen',
    'Gesamtrendite (ROI)',
    'Jährliche Rendite',
    'Amortisationsdauer',
    'Strompreissteigerung modellieren',
    'Einspeisevergütung berücksichtigen',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://tools.42watt.de' },
    { '@type': 'ListItem', position: 2, name: 'PV-Investitionsrechner', item: pageUrl },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wie lange dauert die Amortisation einer PV-Anlage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Typische Photovoltaik-Anlagen amortisieren sich in Deutschland innerhalb von 10–14 Jahren. Die exakte Dauer hängt von Anlagengröße, Eigenverbrauchsanteil, Strompreis, Einspeisevergütung und Standort ab. Mit hohem Eigenverbrauch (>40 %) ist die Amortisation oft unter 10 Jahren möglich.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welche Rendite bringt eine Photovoltaik-Anlage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bei einem Eigenverbrauch von 30 % und einer Lebensdauer von 20 Jahren erzielen PV-Anlagen Renditen von 4–7 % pro Jahr. Das ist deutlich mehr als viele vergleichbar sichere Geldanlagen und zusätzlich inflationsgeschützt, da steigende Strompreise den Eigenverbrauchs-Vorteil erhöhen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Lohnt sich ein Batteriespeicher finanziell?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ein Batteriespeicher erhöht den Eigenverbrauchsanteil typischerweise um 15–25 Prozentpunkte, amortisiert sich bei aktuellen Preisen jedoch selten deutlich vor dem Ende seiner Lebensdauer (ca. 15 Jahre). Er lohnt sich vor allem, wenn Autarkie und Versorgungssicherheit wichtig sind.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie hoch ist die Einspeisevergütung 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Für Neuanlagen bis 10 kWp liegt die Einspeisevergütung (Teileinspeisung) 2026 bei ca. 7,86 ct/kWh. Bei Volleinspeisung bis 10 kWp sind es ca. 12,47 ct/kWh. Die Vergütung wird halbjährlich abgesenkt (Degression).',
      },
    },
    {
      '@type': 'Question',
      name: 'Sind PV-Anlagen umsatzsteuerbefreit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja – seit 2023 gilt für PV-Anlagen bis 30 kWp auf Wohngebäuden der Nullsteuersatz (0 % Umsatzsteuer). Das gilt für Lieferung und Installation der Anlage inklusive Speicher.',
      },
    },
  ],
};

export default function PvInvestitionLayout({ children }: { children: React.ReactNode }) {
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
