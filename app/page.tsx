'use client';

import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://tools.42watt.de/#collection',
  url: 'https://tools.42watt.de',
  name: '42watt Tools – Rechner für PV, Wärmepumpe & Förderung',
  description:
    'Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe und KfW-Förderung.',
  publisher: { '@id': 'https://www.42watt.de/#organization' },
  inLanguage: 'de-DE',
  isPartOf: { '@id': 'https://tools.42watt.de/#website' },
  hasPart: [
    { '@type': 'SoftwareApplication', name: 'KfW Förderrechner', url: 'https://tools.42watt.de/kfw' },
    { '@type': 'SoftwareApplication', name: 'PV & Wärmepumpe Rechner', url: 'https://tools.42watt.de/pv-rechner' },
    { '@type': 'SoftwareApplication', name: 'PV-Investitionsrechner', url: 'https://tools.42watt.de/pv-investition' },
    { '@type': 'SoftwareApplication', name: 'Wärmepumpen-Amortisationsrechner', url: 'https://tools.42watt.de/waermepumpe-rechner' },
    { '@type': 'SoftwareApplication', name: 'PV-Unabhängigkeitsrechner', url: 'https://tools.42watt.de/autarkie-rechner' },
  ],
};

function ToolCard({ href, icon, title, description }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="tool-card group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="tool-icon tool-icon-active">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--color--black)] group-hover:text-[var(--color--light-blue)] transition-colors">
              {title}
            </h3>
            <p className="text-sm text-[var(--color--dark-grey)]">
              {description}
            </p>
          </div>
        </div>
        <svg className="w-5 h-5 text-[var(--color--dark-grey)] group-hover:text-[var(--color--light-blue)] group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// SVG Icons
const icons = {
  sun: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  money: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bolt: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color--light-grey)] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <Header currentPage="home" />

      <main>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color--black)] leading-tight mb-6">
              Deine Energie,<br />intelligent geplant
            </h1>
            <p className="text-lg md:text-xl text-[var(--color--dark-grey)] mb-8 max-w-2xl leading-relaxed">
              Finde heraus, wie du mit Wärmepumpe, PV-Anlage und Fördermitteln
              das Maximum aus deiner Energiewende herausholst.
            </p>
            <a
              href="https://www.42watt.de/warmepumpe-v3?utm_source=tools42watt&utm_medium=tools42watt&utm_campaign=hero_cta"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button text-base"
            >
              Jetzt Angebot einholen
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-16 relative z-10">

        {/* ── Photovoltaik ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color--light-blue)] bg-opacity-10 flex items-center justify-center text-[var(--color--light-blue)]">
              {icons.sun}
            </div>
            <h2 className="text-xl font-bold text-[var(--color--black)]">Photovoltaik</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ToolCard
              href="/pv-investition"
              icon={icons.chart}
              title="PV-Investitionsrechner"
              description="Rendite & Amortisation bewerten"
            />
            <ToolCard
              href="/autarkie-rechner"
              icon={icons.shield}
              title="Unabhängigkeitsrechner"
              description="Autarkie & Eigenverbrauch berechnen"
            />
            <ToolCard
              href="/pv-rechner"
              icon={icons.bolt}
              title="PV & Wärmepumpe"
              description="Gesamtsystem Wirtschaftlichkeit"
            />
          </div>
        </div>

        {/* ── Wärmepumpe ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color--green)] bg-opacity-10 flex items-center justify-center text-[var(--color--green)]">
              {icons.home}
            </div>
            <h2 className="text-xl font-bold text-[var(--color--black)]">Wärmepumpe</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard
              href="/waermepumpe-rechner"
              icon={icons.home}
              title="WP-Amortisationsrechner"
              description="Wärmepumpe vs. Gas, Öl & Co."
            />
            <ToolCard
              href="/kfw"
              icon={icons.money}
              title="KfW Förderrechner"
              description="Staatliche Förderung berechnen"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-section">
          <div className="disclaimer-icon">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="disclaimer-text">
            Die hier angebotenen Tools sind ein freiwilliger Service der 42watt GmbH und befinden sich aktuell im Prototyp-Stadium. Die Berechnungen dienen ausschließlich der unverbindlichen Orientierung. Für die Richtigkeit, Vollständigkeit und Aktualität der Ergebnisse übernehmen wir keine Haftung.
          </p>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
