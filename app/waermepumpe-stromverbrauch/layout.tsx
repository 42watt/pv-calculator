import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wärmepumpen-Stromverbrauchsrechner – Jahresverbrauch & Kosten berechnen | 42watt',
  description:
    'Berechne den Jahresstromverbrauch deiner Wärmepumpe. Basierend auf Wohnfläche, Gebäudetyp und Anlagenart – mit realen JAZ-Werten (Fraunhofer ISE 2025) und monatlicher Verbrauchsverteilung.',
  openGraph: {
    title: 'Wärmepumpen-Stromverbrauchsrechner',
    description:
      'Jahresstromverbrauch deiner Wärmepumpe berechnen – kostenlos & wissenschaftlich fundiert.',
    type: 'website',
  },
};

export default function WaermepumpeStromverbrauchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
