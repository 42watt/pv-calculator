'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Kontakt */}
          <div>
            <h4 className="footer-heading">Kontakt</h4>
            <ul className="footer-links">
              <li>Infanteriestr. 11</li>
              <li>80797 München</li>
              <li><a href="mailto:kundenservice@42watt.de">kundenservice@42watt.de</a></li>
              <li><a href="tel:+498921525090">+49 (0) 89 215 250 90</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span>&copy; {new Date().getFullYear()} | 42watt</span>
          </div>
          <div className="footer-bottom-right">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
