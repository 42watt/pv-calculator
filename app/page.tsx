'use client';

import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color--light-grey)] flex flex-col">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* KfW Förderrechner */}
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

          {/* PV-Wärmepumpenkalkulator */}
          <Link href="/pv-rechner" className="tool-card group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="tool-icon tool-icon-active">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color--black)] group-hover:text-[var(--color--light-blue)] transition-colors">
                    PV-Wärmepumpenkalkulator
                  </h3>
                  <p className="text-sm text-[var(--color--dark-grey)]">
                    Wirtschaftlichkeit berechnen
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--color--dark-grey)] group-hover:text-[var(--color--light-blue)] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* PV-Investitionsrechner */}
          <Link href="/pv-investition" className="tool-card group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="tool-icon tool-icon-active">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color--black)] group-hover:text-[var(--color--light-blue)] transition-colors">
                    PV-Investitionsrechner
                  </h3>
                  <p className="text-sm text-[var(--color--dark-grey)]">
                    PV-Investition bewerten
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--color--dark-grey)] group-hover:text-[var(--color--light-blue)] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* WP-Amortisationsrechner */}
          <Link href="/waermepumpe-rechner" className="tool-card group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="tool-icon tool-icon-active">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color--black)] group-hover:text-[var(--color--light-blue)] transition-colors">
                    WP-Amortisationsrechner
                  </h3>
                  <p className="text-sm text-[var(--color--dark-grey)]">
                    Wärmepumpe vs. Gas, Öl & Co.
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--color--dark-grey)] group-hover:text-[var(--color--light-blue)] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

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

      <Footer />
    </div>
  );
}
