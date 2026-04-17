'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface PricePoint {
  hour: string;
  price: number; // ct/kWh
  unix: number;
  isNow: boolean;
}

function priceColor(price: number): string {
  if (price < 0) return '#ef4444';
  if (price < 5) return '#22c55e';
  if (price < 15) return '#f59e0b';
  return '#ef4444';
}

function PriceBadge({ price }: { price: number }) {
  const color = priceColor(price);
  const label = price < 0 ? 'Negativ' : price < 5 ? 'Günstig' : price < 15 ? 'Mittel' : 'Teuer';
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

interface TooltipProps { active?: boolean; payload?: { value: number }[]; label?: string; }
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const price = payload[0].value as number;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label} Uhr</p>
      <p className="font-bold text-lg" style={{ color: priceColor(price) }}>
        {price.toFixed(2)} ct/kWh
      </p>
      <PriceBadge price={price} />
    </div>
  );
};

export default function Strompreis() {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/strompreis');
        if (!res.ok) throw new Error('API nicht erreichbar');
        const json = await res.json();

        const nowUnix = Math.floor(Date.now() / 1000);

        // Keep last 48h of data
        const cutoff = nowUnix - 24 * 3600;
        const points: PricePoint[] = [];

        for (let i = 0; i < json.unix_seconds.length; i++) {
          const unix = json.unix_seconds[i];
          if (unix < cutoff) continue;
          const date = new Date(unix * 1000);
          const hour = date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Berlin',
          });
          const priceMwh = json.price[i];
          const priceCtKwh = priceMwh / 10; // EUR/MWh → ct/kWh
          points.push({
            hour,
            price: Math.round(priceCtKwh * 100) / 100,
            unix,
            isNow: Math.abs(unix - nowUnix) < 3600,
          });
        }

        setData(points);
        setLastUpdated(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const currentPoint = data.find((d) => d.isNow) ?? data[data.length - 1];
  const minPrice = data.length ? Math.min(...data.map((d) => d.price)) : 0;
  const maxPrice = data.length ? Math.max(...data.map((d) => d.price)) : 0;
  const avgPrice = data.length
    ? Math.round((data.reduce((s, d) => s + d.price, 0) / data.length) * 100) / 100
    : 0;

  // Dot color per point
  const renderDot = (props: { cx?: number; cy?: number; payload?: PricePoint }) => {
    const { cx, cy, payload } = props;
    if (!payload?.isNow) return <g key={`dot-${cx}-${cy}`} />;
    return (
      <circle
        key={`dot-now-${cx}`}
        cx={cx}
        cy={cy}
        r={6}
        fill={priceColor(payload.price)}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color--light-grey)] flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color--dark-blue)] mb-1">
            Aktueller Börsenstrompreis
          </h1>
          <p className="text-[var(--color--dark-grey)] text-sm">
            Day-ahead Spotmarktpreise für Deutschland · Bidding Zone DE-LU
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 flex items-center justify-center">
            <div className="text-[var(--color--dark-grey)]">Preise werden geladen…</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
            Fehler beim Laden: {error}
          </div>
        )}

        {!loading && !error && currentPoint && (
          <>
            {/* Current price hero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:col-span-1 flex flex-col items-center justify-center text-center">
                <div className="text-sm text-[var(--color--dark-grey)] mb-1">Aktuell ({currentPoint.hour} Uhr)</div>
                <div
                  className="text-5xl font-bold mb-2"
                  style={{ color: priceColor(currentPoint.price) }}
                >
                  {currentPoint.price.toFixed(2)}
                </div>
                <div className="text-[var(--color--dark-grey)] text-sm mb-3">ct/kWh</div>
                <PriceBadge price={currentPoint.price} />
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:col-span-2 grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="text-xs text-[var(--color--dark-grey)] mb-1">Minimum (48h)</div>
                  <div className="text-2xl font-bold text-green-500">{minPrice.toFixed(2)}</div>
                  <div className="text-xs text-[var(--color--dark-grey)]">ct/kWh</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[var(--color--dark-grey)] mb-1">Durchschnitt</div>
                  <div className="text-2xl font-bold text-[var(--color--dark-blue)]">{avgPrice.toFixed(2)}</div>
                  <div className="text-xs text-[var(--color--dark-grey)]">ct/kWh</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[var(--color--dark-grey)] mb-1">Maximum (48h)</div>
                  <div className="text-2xl font-bold text-red-500">{maxPrice.toFixed(2)}</div>
                  <div className="text-xs text-[var(--color--dark-grey)]">ct/kWh</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-[var(--color--dark-blue)] mb-4">
                Preisverlauf (letzte 48 Stunden)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    interval={3}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v} ct`}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
                  <ReferenceLine
                    y={avgPrice}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: 'Ø', position: 'insideTopRight', fontSize: 11, fill: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--color--light-blue, #3b82f6)"
                    strokeWidth={2}
                    dot={renderDot}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--color--dark-grey)]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> &lt; 5 ct/kWh – günstig</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> 5–15 ct/kWh – mittel</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &gt; 15 ct/kWh – teuer</span>
              </div>
            </div>

            {/* Hinweis dynamischer Tarif */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-amber-800 mb-1">Mit dynamischem Stromtarif sparen</h3>
              <p className="text-sm text-amber-700 mb-3">
                Wer einen dynamischen Tarif hat, zahlt den Börsenpreis direkt – und kann gezielt in günstigen Stunden laden und verbrauchen. Besonders in Kombination mit PV-Anlage, Batterie oder Wärmepumpe lohnt sich das.
              </p>
              <a
                href="https://42watt.checkout.energy/start"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Jetzt dynamischen Tarif abschließen
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </>
        )}

        {/* Attribution */}
        <p className="text-xs text-[var(--color--dark-grey)] text-center">
          Preisdaten:{' '}
          <a
            href="https://api.energy-charts.info"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--color--dark-blue)]"
          >
            Energy Charts API
          </a>{' '}
          · Fraunhofer ISE
          {lastUpdated && ` · Stand: ${lastUpdated} Uhr`}
        </p>
      </main>
      <Footer />
    </div>
  );
}
