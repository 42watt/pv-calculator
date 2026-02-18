'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Produkte */}
          <div>
            <h4 className="footer-heading">Produkte</h4>
            <ul className="footer-links">
              <li><a href="https://www.42watt.de/waermepumpe" target="_blank" rel="noopener noreferrer">Wärmepumpe</a></li>
              <li><a href="https://www.42watt.de/photovoltaik" target="_blank" rel="noopener noreferrer">Photovoltaik</a></li>
              <li><a href="https://www.42watt.de/ems" target="_blank" rel="noopener noreferrer">EMS</a></li>
              <li><a href="https://www.42watt.de/wallbox" target="_blank" rel="noopener noreferrer">Wallbox</a></li>
              <li><a href="https://www.42watt.de/batteriespeicher" target="_blank" rel="noopener noreferrer">Batteriespeicher</a></li>
              <li><a href="https://www.42watt.de/klimaanlage" target="_blank" rel="noopener noreferrer">Klimaanlage</a></li>
            </ul>
          </div>

          {/* Karriere */}
          <div>
            <h4 className="footer-heading">Karriere</h4>
            <ul className="footer-links">
              <li><a href="https://www.42watt.de/karriere" target="_blank" rel="noopener noreferrer">Jobs bei 42watt</a></li>
            </ul>
          </div>

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
