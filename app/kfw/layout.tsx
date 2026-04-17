import type { Metadata } from 'next';

const pageUrl = 'https://tools.42watt.de/kfw';

export const metadata: Metadata = {
  title: 'KfW Förderrechner 2026 – Wärmepumpen-Zuschuss bis 70 % berechnen',
  description:
    'KfW-Förderung für Wärmepumpen online berechnen: Grundförderung, Klimageschwindigkeitsbonus, Einkommensbonus und Effizienzbonus. Bis zu 70 % Zuschuss, max. 21.000 €.',
  keywords: [
    'KfW Förderrechner',
    'KfW 458',
    'Wärmepumpe Förderung 2026',
    'BEG EM',
    'Klimageschwindigkeitsbonus',
    'Einkommensbonus',
    'Effizienzbonus Wärmepumpe',
    'Heizungsförderung',
    'Zuschuss Wärmepumpe',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: pageUrl,
    siteName: '42watt Tools',
    title: 'KfW Förderrechner 2026 – Wärmepumpen-Zuschuss berechnen',
    description: 'Berechne deine KfW-Förderung für Wärmepumpen: Bis zu 70 % Zuschuss, max. 21.000 €.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KfW Förderrechner 2026 – Wärmepumpen-Zuschuss',
    description: 'Bis zu 70 % Zuschuss berechnen – kostenlos & aktuell.',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${pageUrl}#software`,
  name: 'KfW Förderrechner',
  alternateName: 'Wärmepumpe KfW-Zuschussrechner',
  url: pageUrl,
  description:
    'Kostenloser Online-Rechner zur Berechnung der KfW-Förderung (BEG EM, KfW 458) für Wärmepumpen. Grundförderung, Klimageschwindigkeitsbonus, Einkommensbonus und Effizienzbonus auf einen Blick.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  datePublished: '2025-01-01',
  dateModified: '2026-04-17',
  featureList: [
    'Grundförderung 30 %',
    'Klimageschwindigkeitsbonus 20 %',
    'Einkommensbonus 30 %',
    'Effizienzbonus 5 %',
    'Förderfähige Kosten prüfen',
    'Maximaler Zuschuss 21.000 €',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Tools', item: 'https://tools.42watt.de' },
    { '@type': 'ListItem', position: 2, name: 'KfW Förderrechner', item: pageUrl },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wie hoch ist die KfW-Förderung für eine Wärmepumpe 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Die KfW-Förderung für Wärmepumpen beträgt bis zu 70 % der förderfähigen Kosten – maximal 21.000 € Zuschuss pro Wohneinheit. Sie setzt sich zusammen aus Grundförderung (30 %), Klimageschwindigkeitsbonus (20 %), Einkommensbonus (30 %) und Effizienzbonus (5 %). Die Boni sind auf insgesamt 70 % begrenzt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wer bekommt den Einkommensbonus der KfW?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Den Einkommensbonus von 30 % erhalten selbstnutzende Eigentümer (Einfamilienhaus oder Eigentumswohnung) mit einem zu versteuernden Haushaltseinkommen bis 40.000 € pro Jahr (Durchschnitt der letzten beiden Steuerjahre).',
      },
    },
    {
      '@type': 'Question',
      name: 'Welche Wärmepumpen sind förderfähig?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Förderfähig sind Luft-Wasser-, Sole-Wasser- (Erdwärme) und Wasser-Wasser-Wärmepumpen, die die ETAs-Kriterien des BEG erfüllen. Das BAFA führt eine öffentliche Liste der förderfähigen Geräte. Der Effizienzbonus (+5 %) wird für natürliche Kältemittel oder Erdwärme gewährt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wie funktioniert der Klimageschwindigkeitsbonus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Der Klimageschwindigkeitsbonus in Höhe von 20 % wird gewährt, wenn eine funktionstüchtige alte Öl-, Kohle-, Nachtspeicher- oder Gasheizung (mind. 20 Jahre alt) ausgetauscht wird. Ab 2029 sinkt der Bonus schrittweise, daher früher handeln lohnt sich.',
      },
    },
    {
      '@type': 'Question',
      name: 'Muss die KfW-Förderung vor Auftragsvergabe beantragt werden?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja – die Förderung muss vor Vertragsunterzeichnung mit dem ausführenden Fachbetrieb bei der KfW beantragt werden. Ein Energieeffizienz-Experte (EEE) oder Fachunternehmen mit BzA-Berechtigung erstellt die notwendige Bestätigung.',
      },
    },
  ],
};

export default function KfwLayout({ children }: { children: React.ReactNode }) {
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
