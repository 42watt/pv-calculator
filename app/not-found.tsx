import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--w-surface)' }}>
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-light text-[var(--w-blue)] mb-4" style={{ fontWeight: 300 }}>404</div>
          <h1 className="text-2xl font-semibold text-[var(--color--dark-blue)] mb-3">
            Seite nicht gefunden
          </h1>
          <p className="text-[var(--color--dark-grey)] mb-8">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--w-blue)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Zurück zur Startseite
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
