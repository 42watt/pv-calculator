'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  currentPage?: 'home' | 'pv' | 'kfw' | 'pv-investition' | 'wp-rechner' | 'autarkie' | 'admin';
}

export default function Header({ currentPage }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-bar">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.svg" alt="42watt – Zurück zur Startseite" width={120} height={32} priority />
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="nav-link flex items-center gap-1.5"
            >
              Tools
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {toolsOpen && (
              <div className="tools-dropdown !min-w-[320px]">
                {/* PV Section */}
                <div className="px-4 pt-2 pb-1">
                  <div className="text-[10px] font-semibold text-[var(--color--dark-grey)] uppercase tracking-wider">Photovoltaik</div>
                </div>
                <Link
                  href="/pv-investition"
                  className={`dropdown-item ${currentPage === 'pv-investition' ? 'dropdown-item-active' : ''}`}
                  onClick={() => setToolsOpen(false)}
                >
                  <Image src="/aufzaehlung.svg" alt="" width={20} height={20} className="flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color--black)]">PV-Investitionsrechner</div>
                    <div className="text-xs text-[var(--color--dark-grey)]">Rendite & Amortisation</div>
                  </div>
                </Link>
                <Link
                  href="/autarkie-rechner"
                  className={`dropdown-item ${currentPage === 'autarkie' ? 'dropdown-item-active' : ''}`}
                  onClick={() => setToolsOpen(false)}
                >
                  <Image src="/aufzaehlung.svg" alt="" width={20} height={20} className="flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color--black)]">Unabhängigkeitsrechner</div>
                    <div className="text-xs text-[var(--color--dark-grey)]">Autarkie & Eigenverbrauch</div>
                  </div>
                </Link>
                <Link
                  href="/pv-rechner"
                  className={`dropdown-item ${currentPage === 'pv' ? 'dropdown-item-active' : ''}`}
                  onClick={() => setToolsOpen(false)}
                >
                  <Image src="/aufzaehlung.svg" alt="" width={20} height={20} className="flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color--black)]">PV & Wärmepumpe</div>
                    <div className="text-xs text-[var(--color--dark-grey)]">Gesamtsystem Wirtschaftlichkeit</div>
                  </div>
                </Link>

                {/* Divider */}
                <div className="mx-4 my-1 border-t border-[var(--color--medium-grey)]"></div>

                {/* WP Section */}
                <div className="px-4 pt-1 pb-1">
                  <div className="text-[10px] font-semibold text-[var(--color--dark-grey)] uppercase tracking-wider">Wärmepumpe</div>
                </div>
                <Link
                  href="/waermepumpe-rechner"
                  className={`dropdown-item ${currentPage === 'wp-rechner' ? 'dropdown-item-active' : ''}`}
                  onClick={() => setToolsOpen(false)}
                >
                  <Image src="/aufzaehlung.svg" alt="" width={20} height={20} className="flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color--black)]">WP-Amortisationsrechner</div>
                    <div className="text-xs text-[var(--color--dark-grey)]">Wärmepumpe vs. Altsystem</div>
                  </div>
                </Link>
                <Link
                  href="/kfw"
                  className={`dropdown-item ${currentPage === 'kfw' ? 'dropdown-item-active' : ''}`}
                  onClick={() => setToolsOpen(false)}
                >
                  <Image src="/aufzaehlung.svg" alt="" width={20} height={20} className="flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color--black)]">KfW Förderrechner</div>
                    <div className="text-xs text-[var(--color--dark-grey)]">Fördermittel berechnen</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Right - CTA Button */}
        <div className="hidden md:flex items-center">
          <a
            href="https://www.42watt.de/warmepumpe-v3?utm_source=tools42watt&utm_medium=tools42watt&utm_campaign=header_cta"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button"
          >
            Jetzt Angebot einholen
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Mobile Burger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-[var(--color--black)] hover:bg-[var(--color--light-grey)] rounded-lg transition-colors"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color--medium-grey)]">
          <div className="px-4 py-4 space-y-1">
            {/* PV Section */}
            <div className="text-xs font-semibold text-[var(--color--dark-grey)] uppercase tracking-wider px-3 py-2">
              Photovoltaik
            </div>
            <Link
              href="/pv-investition"
              className={`mobile-nav-item ${currentPage === 'pv-investition' ? 'mobile-nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Image src="/aufzaehlung.svg" alt="" width={16} height={16} />
              PV-Investitionsrechner
            </Link>
            <Link
              href="/autarkie-rechner"
              className={`mobile-nav-item ${currentPage === 'autarkie' ? 'mobile-nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Image src="/aufzaehlung.svg" alt="" width={16} height={16} />
              Unabhängigkeitsrechner
            </Link>
            <Link
              href="/pv-rechner"
              className={`mobile-nav-item ${currentPage === 'pv' ? 'mobile-nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Image src="/aufzaehlung.svg" alt="" width={16} height={16} />
              PV & Wärmepumpe
            </Link>

            {/* WP Section */}
            <div className="text-xs font-semibold text-[var(--color--dark-grey)] uppercase tracking-wider px-3 py-2 mt-3">
              Wärmepumpe
            </div>
            <Link
              href="/waermepumpe-rechner"
              className={`mobile-nav-item ${currentPage === 'wp-rechner' ? 'mobile-nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Image src="/aufzaehlung.svg" alt="" width={16} height={16} />
              WP-Amortisationsrechner
            </Link>
            <Link
              href="/kfw"
              className={`mobile-nav-item ${currentPage === 'kfw' ? 'mobile-nav-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Image src="/aufzaehlung.svg" alt="" width={16} height={16} />
              KfW Förderrechner
            </Link>

            <div className="pt-3">
              <a
                href="https://www.42watt.de/warmepumpe-v3?utm_source=tools42watt&utm_medium=tools42watt&utm_campaign=mobile_cta"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button w-full justify-center"
              >
                Jetzt Angebot einholen
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
