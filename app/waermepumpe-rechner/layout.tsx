import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/waermepumpe-rechner';

export const metadata: Metadata = {
  title: 'Wärmepumpen-Rechner 2026 – Kosten vs. Gas, Öl, Fernwärme',
  description:
    'Wärmepumpe oder Gas, Öl, Nachtspeicher, Fernwärme? Vergleiche Betriebskosten, Amortisation und CO₂-Einsparung – mit aktuellen BDEW- und Fraunhofer-ISE-Daten 2026.',
  keywords: [
    'Wärmepumpen-Rechner',
    'Wärmepumpe Amortisation',
    'Wärmepumpe vs Gas',
    'Wärmepumpe vs Öl',
    'Wärmepumpe Betriebskosten',
    'Heizkostenvergleich',
    'Wärmepumpe Fernwärme',
    'Wärmepumpe Kosten',
    'JAZ Wärmepumpe',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: pageUrl,
    siteName: '42watt Tools',
    title: 'Wärmepumpen-Rechner – Kosten vs. Gas, Öl & Co.',
    description: 'Vergleiche Wärmepumpe mit Gas, Öl, Nachtspeicher oder Fernwärme – Amortisation berechnen.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wärmepumpen-Rechner – Kostenvergleich',
    description: 'Wärmepumpe vs. Gas, Öl, Nachtspeicher, Fernwärme.',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${pageUrl}#software`,
  name: 'Wärmepumpen-Amortisationsrechner',
  alternateName: ['Heizkosten-Rechner', 'Wärmepumpe-Kostenvergleich'],
  url: pageUrl,
  description:
    'Kostenloser Amortisationsrechner für Luft-Wasser-Wärmepumpen. Vergleicht Investition und Betriebskosten mit Gas, Öl, Nachtspeicher und Fernwärme auf Basis aktueller BDEW- und Fraunhofer-ISE-Daten.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  datePublished: '2025-03-22',
  dateModified: '2026-04-17',
  featureList: [
    'Wärmepumpe vs. Gas',
    'Wärmepumpe vs. Öl',
    'Wärmepumpe vs. Nachtspeicher',
    'Wärmepumpe vs. Fernwärme',
    'Betriebskosten-Vergleich',
    'Amortisation berechnen',
    'CO₂-Einsparung ermitteln',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://tools.42watt.de' },
    { '@type': 'ListItem', position: 2, name: 'Wärmepumpen-Rechner', item: pageUrl },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Lohnt sich eine Wärmepumpe wirtschaftlich?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In den meisten Bestandsgebäuden amortisiert sich eine Wärmepumpe innerhalb von 8–15 Jahren – bei aktiver Nutzung der KfW-Förderung (bis zu 70 % Zuschuss) sogar deutlich schneller. Die Betriebskosten liegen typischerweise 20–40 % unter einer Gasheizung, abhängig von JAZ und Strompreis.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie viel Strom verbraucht eine Wärmepumpe pro Jahr?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Der Stromverbrauch ergibt sich aus Heizwärmebedarf geteilt durch Jahresarbeitszahl (JAZ). Beispiel: Ein Einfamilienhaus mit 18.000 kWh Heizwärmebedarf und JAZ 3,2 verbraucht rund 5.600 kWh Strom pro Jahr. Eine gut ausgelegte Luft-Wasser-Wärmepumpe erreicht JAZ 3,0–4,0, Erdwärmepumpen sogar 4,0–5,0.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wärmepumpe oder Gasheizung – was ist günstiger?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bei aktuellen Energiepreisen ist eine Wärmepumpe im Betrieb bereits günstiger als eine Gasheizung. Mit der steigenden CO₂-Abgabe auf Gas (ab 2027 stark zunehmend) und dauerhaft sinkenden Strompreisen im Zuge der Energiewende wird dieser Vorteil weiter zunehmen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Funktioniert eine Wärmepumpe auch im Altbau?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja – moderne Hochtemperatur-Wärmepumpen erreichen Vorlauftemperaturen bis 75 °C und sind auch im unsanierten Altbau einsetzbar. Optimal ist ein hydraulischer Abgleich und der Austausch einzelner kritischer Heizkörper. Fraunhofer-ISE-Studien bestätigen JAZ von 2,8–3,4 auch in Bestandsgebäuden.',
      },
    },
    {
      '@type': 'Question',
      name: 'Was kostet eine Wärmepumpe inklusive Einbau?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Eine Luft-Wasser-Wärmepumpe kostet inklusive Einbau typischerweise 25.000–40.000 € (vor Förderung). Mit maximaler KfW-Förderung (bis 70 %) sinkt der Eigenanteil auf 8.000–15.000 €. Erdwärmepumpen sind teurer (35.000–55.000 €), haben aber höhere JAZ und niedrigere Betriebskosten.',
      },
    },
  ],
};

export default function WpRechnerLayout({ children }: { children: React.ReactNode }) {
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
