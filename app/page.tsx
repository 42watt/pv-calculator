'use client';

import Link from 'next/link';
import Header from './components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color--light-grey)]">
      <Header currentPage="home" />

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
              href="https://www.42watt.de/warmepumpe-v3"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* KfW Förderrechner - Active */}
          <Link href="/kfw" className="tool-card group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="tool-icon tool-icon-active">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color--black)] group-hover:text-[var(--color--light-blue)] transition-colors">
                    KfW Förderrechner
                  </h3>
                  <p className="text-sm text-[var(--color--dark-grey)]">
                    Berechne deine staatliche Förderung
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--color--dark-grey)] group-hover:text-[var(--color--light-blue)] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* PV-Rechner - Coming Soon */}
          <div className="tool-card tool-card-disabled">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="tool-icon tool-icon-disabled">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color--dark-grey)]">
                    PV-Wärmepumpenkalkulator
                  </h3>
                  <p className="text-sm text-[var(--color--medium-grey)]">
                    Wirtschaftlichkeit berechnen
                  </p>
                </div>
              </div>
              <span className="coming-soon-badge">
                Coming Soon
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
