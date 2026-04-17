import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/autarkie-rechner';

export const metadata: Metadata = {
  title: 'Autarkie-Rechner 2026 – PV-Unabhängigkeit & Eigenverbrauch',
  description:
    'Berechne Autarkiegrad und Eigenverbrauchsanteil deiner Photovoltaik – mit Batteriespeicher, Wärmepumpe und E-Auto. Kostenlos, sofort & ohne Anmeldung.',
  keywords: [
    'Autarkierechner',
    'Unabhängigkeitsrechner',
    'PV Autarkie',
    'Eigenverbrauch berechnen',
    'Photovoltaik Eigenverbrauchsanteil',
    'Batteriespeicher Autarkie',
    'HTW Berlin Modell',
    'Autarkiegrad Photovoltaik',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: pageUrl,
    siteName: '42watt Tools',
    title: 'Autarkie-Rechner – PV-Unabhängigkeit & Eigenverbrauch berechnen',
    description:
      'Berechne Autarkiegrad und Eigenverbrauchsanteil deiner Photovoltaik mit Speicher, Wärmepumpe und E-Auto.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autarkie-Rechner – PV-Unabhängigkeit berechnen',
    description:
      'Berechne Autarkiegrad und Eigenverbrauch deiner PV-Anlage. Kostenlos & sofort.',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${pageUrl}#software`,
  name: 'PV-Unabhängigkeitsrechner',
  alternateName: ['Autarkie-Rechner', 'Eigenverbrauchsrechner'],
  url: pageUrl,
  description:
    'Kostenloser Online-Rechner für Autarkiegrad und Eigenverbrauchsanteil einer Photovoltaik-Anlage. Basiert auf empirischen HTW-Berlin-Modellen inkl. Batteriespeicher, Wärmepumpe und E-Auto.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript. Modern browser.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  datePublished: '2025-02-15',
  dateModified: '2026-04-17',
  featureList: [
    'Autarkiegrad berechnen',
    'Eigenverbrauchsanteil bestimmen',
    'Batteriespeicher-Optimierung',
    'Wärmepumpen-Integration',
    'E-Auto Stromverbrauch',
    'Monatliche Erzeugung vs. Verbrauch',
    'CO₂-Ersparnis berechnen',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://tools.42watt.de' },
    { '@type': 'ListItem', position: 2, name: 'Autarkie-Rechner', item: pageUrl },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Was ist der Unterschied zwischen Autarkiegrad und Eigenverbrauchsanteil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Der Autarkiegrad misst, welcher Anteil des gesamten Stromverbrauchs durch die eigene PV-Anlage gedeckt wird. Der Eigenverbrauchsanteil beschreibt dagegen, welcher Anteil des erzeugten PV-Stroms selbst verbraucht statt eingespeist wird.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welcher Autarkiegrad ist mit Photovoltaik realistisch?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ohne Batteriespeicher erreichen typische Einfamilienhäuser 25–35 % Autarkie. Mit einem 10 kWh-Speicher steigt der Wert auf 55–70 %. In Kombination mit Wärmepumpe, E-Auto und Energiemanagementsystem sind bis zu 80 % Autarkie möglich. Eine vollständige 100 %-Autarkie ist nur mit Saisonspeichern (Wasserstoff, Power-to-Heat) realisierbar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie groß sollte der Batteriespeicher bei 10 kWp PV sein?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Als Faustregel gilt: 1 kWh Speicher pro 1 kWp PV-Leistung. Für eine 10 kWp-Anlage sind 8–12 kWh Speicherkapazität optimal – größere Speicher bringen überproportional wenig zusätzlichen Nutzen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Erhöhen Wärmepumpe und E-Auto die Autarkie?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja – zusätzliche flexible Verbraucher wie Wärmepumpe und E-Auto verbessern den Eigenverbrauchsanteil deutlich, weil mehr PV-Strom direkt im Haus genutzt werden kann. In Kombination mit einem Energiemanagementsystem (EMS) steigt die Autarkie nochmals um 5–10 Prozentpunkte.',
      },
    },
  ],
};

export default function AutarkieLayout({ children }: { children: React.ReactNode }) {
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
