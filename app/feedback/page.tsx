'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

type Category = 'problem' | 'feature' | 'general';

const categories: { value: Category; label: string; description: string }[] = [
  { value: 'problem', label: 'Problem / Bug', description: 'Etwas funktioniert nicht wie erwartet' },
  { value: 'feature', label: 'Feature Request', description: 'Ich hätte gerne eine neue Funktion' },
  { value: 'general', label: 'Allgemeines', description: 'Sonstiges Feedback oder Anmerkungen' },
];

export default function FeedbackPage() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      setErrorMsg('Bitte wähle eine Kategorie aus.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Ein Fehler ist aufgetreten.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('Verbindungsfehler. Bitte versuche es erneut.');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--w-surface)' }}>
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 md:py-16">

        {/* Page head */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--w-blue)' }}>
            42watt Tools
          </p>
          <h1 className="text-3xl md:text-4xl mb-3" style={{ fontWeight: 300, color: '#222222' }}>
            Feedback geben
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#8c8c8c' }}>
            Melde einen Bug, schlage ein neues Feature vor oder schreib uns einfach, was du denkst.
            Wir lesen jede Nachricht.
          </p>
        </div>

        {status === 'success' ? (
          <div className="border p-8 text-center" style={{ borderColor: 'var(--w-border)', background: 'white' }}>
            <div
              className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(52, 69, 255, 0.08)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--w-blue)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>Danke für dein Feedback!</h2>
            <p className="text-sm mb-6" style={{ color: '#8c8c8c' }}>
              Deine Nachricht wurde erfolgreich gesendet. Wir melden uns wenn nötig per E-Mail.
            </p>
            <button
              onClick={() => {
                setStatus('idle');
                setEmail('');
                setCategory('');
                setMessage('');
              }}
              className="text-sm font-medium underline underline-offset-4"
              style={{ color: 'var(--w-blue)' }}
            >
              Weiteres Feedback senden
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#6B7280' }}
              >
                Deine E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="max@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  border: '1px solid var(--w-border)',
                  background: 'white',
                  color: '#222222',
                  borderRadius: 0,
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--w-blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--w-border)')}
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                Kategorie
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className="p-4 text-left transition-colors"
                    style={{
                      border: `1px solid ${category === cat.value ? 'var(--w-blue)' : 'var(--w-border)'}`,
                      background: category === cat.value ? 'rgba(52, 69, 255, 0.05)' : 'white',
                      borderRadius: 0,
                    }}
                  >
                    <span
                      className="block text-sm font-semibold mb-1"
                      style={{ color: category === cat.value ? 'var(--w-blue)' : '#222222' }}
                    >
                      {cat.label}
                    </span>
                    <span className="block text-xs leading-relaxed" style={{ color: '#8c8c8c' }}>
                      {cat.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-8">
              <label
                htmlFor="message"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#6B7280' }}
              >
                Nachricht
              </label>
              <textarea
                id="message"
                required
                rows={6}
                placeholder="Beschreibe dein Anliegen so genau wie möglich…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none transition-colors resize-vertical"
                style={{
                  border: '1px solid var(--w-border)',
                  background: 'white',
                  color: '#222222',
                  borderRadius: 0,
                  minHeight: 140,
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--w-blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--w-border)')}
              />
              <p className="text-xs mt-1" style={{ color: '#bababa' }}>
                {message.length} / 5000 Zeichen
              </p>
            </div>

            {/* Error */}
            {(status === 'error' || errorMsg) && (
              <div
                className="mb-6 px-4 py-3 text-sm border"
                style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#b91c1c' }}
              >
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: 'var(--w-blue)', borderRadius: 0 }}
            >
              {status === 'loading' ? 'Wird gesendet…' : 'Feedback absenden'}
            </button>

            <p className="text-xs mt-4 text-center" style={{ color: '#bababa' }}>
              Deine Nachricht geht direkt an das 42watt-Team.
              Mit dem Absenden stimmst du unserer{' '}
              <Link href="/datenschutz" className="underline underline-offset-2" style={{ color: '#8c8c8c' }}>
                Datenschutzerklärung
              </Link>{' '}
              zu.
            </p>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
