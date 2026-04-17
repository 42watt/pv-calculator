import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/strompreis';

export const metadata: Metadata = {
  title: 'Börsenstrompreis live – Spotmarktpreise Deutschland stündlich',
  description:
    'Aktueller Börsenstrompreis (Day-Ahead) für Deutschland im Stundenchart. Günstige Stunden erkennen – ideal für Wärmepumpe, E-Auto und Batteriespeicher mit dynamischem Tarif.',
  keywords: [
    'Börsenstrompreis',
    'Spotmarktpreis Strom',
    'Strompreis heute',
    'Day-Ahead Preis',
    'Dynamischer Stromtarif',
    'EPEX Spot',
    'Strompreis stündlich',
    'Strompreis live',
    'Strompreiszusammensetzung',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: pageUrl,
    siteName: '42watt Tools',
    title: 'Börsenstrompreis live – Spotmarktpreise Deutschland',
    description:
      'Aktueller Börsenstrompreis im Stundenchart. Günstige Stunden für Wärmepumpe, E-Auto und Batterie erkennen.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Börsenstrompreis live – Spotmarktpreise Deutschland',
    description: 'Aktueller Börsenstrompreis im Stundenchart – täglich aktualisiert.',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${pageUrl}#software`,
  name: 'Börsenstrompreis live',
  alternateName: ['Spotmarktpreis-Tracker', 'Day-Ahead-Preis Deutschland'],
  url: pageUrl,
  description:
    'Live-Visualisierung des deutschen Day-Ahead-Börsenstrompreises (EPEX Spot) mit stündlicher Auflösung. Enthält eine transparente Zerlegung des Endkundenpreises in Netzentgelte, Steuern, Umlagen und Börsenpreis.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  datePublished: '2025-03-01',
  dateModified: '2026-04-17',
  featureList: [
    'Live Börsenstrompreis (EPEX Spot)',
    'Stündliche Preiskurve 24h',
    'Preisklassifikation (günstig, mittel, teuer, negativ)',
    'Strompreiszusammensetzung Endkunde',
    'Mobile-optimierter Chart',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://tools.42watt.de' },
    { '@type': 'ListItem', position: 2, name: 'Börsenstrompreis', item: pageUrl },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Was ist der Börsenstrompreis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Der Börsenstrompreis (Day-Ahead-Preis) ist der stündlich an der europäischen Strombörse EPEX Spot festgelegte Großhandelspreis für Strom. Er wird täglich um 12 Uhr für die 24 Stunden des nächsten Tages ermittelt und ist Grundlage aller dynamischen Stromtarife.',
      },
    },
    {
      '@type': 'Question',
      name: 'Warum ist der Strompreis manchmal negativ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Negative Strompreise entstehen, wenn das Angebot an Strom (z. B. durch viel Wind- und Solarstrom) die Nachfrage deutlich übersteigt. Erzeuger zahlen dann dafür, ihren Strom abzugeben, weil das Abschalten von Kraftwerken teurer wäre als der Verlust.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie setzt sich der Endkunden-Strompreis zusammen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Der Haushaltsstrompreis besteht typischerweise zu 25 % aus Beschaffung (Börsenpreis + Margen), 25 % Netzentgelten und Messstellenbetrieb, 25 % Steuern (Umsatzsteuer, Stromsteuer) und 25 % Umlagen (KWK, §19 NEV, Offshore, Konzessionsabgabe).',
      },
    },
    {
      '@type': 'Question',
      name: 'Lohnt sich ein dynamischer Stromtarif mit PV und Wärmepumpe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja – dynamische Tarife orientieren sich am stündlichen Börsenstrompreis. Wer Wärmepumpe, E-Auto oder Batterie gezielt in günstigen Stunden laden kann, spart jährlich typischerweise 100–300 € gegenüber einem Festpreis-Tarif.',
      },
    },
  ],
};

export default function StrompreisLayout({ children }: { children: React.ReactNode }) {
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
