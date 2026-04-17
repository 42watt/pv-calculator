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

// Typische Preisbestandteile für Haushaltskunden in Deutschland (netto, ct/kWh)
// Quellen: BNetzA Monitoringbericht, BDEW Strompreisanalyse
const PRICE_COMPONENTS = {
  grid: 10.3,        // Netzentgelte + Messstellenbetrieb
  taxes: 2.05,       // Stromsteuer
  levies: 1.8,       // §19 NEV, KWK, Offshore, Konzessionsabgabe
  providerMargin: 1.5, // Anbieter-Aufschlag dynamischer Tarif
};
const VAT = 0.19;
const FIXED_NET = PRICE_COMPONENTS.grid + PRICE_COMPONENTS.taxes + PRICE_COMPONENTS.levies + PRICE_COMPONENTS.providerMargin;
const TYPICAL_FIXED_TARIFF = 34; // ct/kWh brutto (Durchschnitt Festpreis 2025)

function calculateEndPrice(spotPriceCtKwh: number) {
  const netTotal = spotPriceCtKwh + FIXED_NET;
  const grossTotal = netTotal * (1 + VAT);
  return {
    spotGross: spotPriceCtKwh * (1 + VAT),
    gridGross: PRICE_COMPONENTS.grid * (1 + VAT),
    taxesLeviesGross: (PRICE_COMPONENTS.taxes + PRICE_COMPONENTS.levies) * (1 + VAT),
    providerGross: PRICE_COMPONENTS.providerMargin * (1 + VAT),
    total: grossTotal,
  };
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
              <h2 className="text-base sm:text-lg font-bold text-[var(--color--dark-blue)] mb-3 sm:mb-4">
                Preisverlauf (letzte 48 Stunden)
              </h2>
              <div className="w-full" style={{ minHeight: isMobile ? 220 : 280 }}>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
                  <LineChart
                    data={data}
                    margin={{ top: 8, right: isMobile ? 8 : 16, left: isMobile ? -10 : 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                      interval={isMobile ? 7 : 3}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: isMobile ? 9 : 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}`}
                      width={isMobile ? 32 : 55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
                    <ReferenceLine
                      y={avgPrice}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{ value: 'Ø', position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
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
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4 text-[11px] sm:text-xs text-[var(--color--dark-grey)]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> &lt; 5 ct – günstig</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 5–15 ct – mittel</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> &gt; 15 ct – teuer</span>
              </div>
            </div>

            {/* Preiszusammensetzung */}
            {(() => {
              const breakdown = calculateEndPrice(currentPoint.price);
              const savings = TYPICAL_FIXED_TARIFF - breakdown.total;
              const segments = [
                { label: 'Börsenpreis', value: breakdown.spotGross, color: '#3b82f6', description: 'Variabel – schwankt stündlich' },
                { label: 'Netzentgelte', value: breakdown.gridGross, color: '#64748b', description: 'Netznutzung & Messstellenbetrieb' },
                { label: 'Steuern & Abgaben', value: breakdown.taxesLeviesGross, color: '#475569', description: 'Stromsteuer, KWK, Konzession' },
                { label: 'Anbieter', value: breakdown.providerGross, color: '#94a3b8', description: 'Aufschlag des Tarifanbieters' },
              ];
              const totalForBar = segments.reduce((s, seg) => s + seg.value, 0);

              return (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-lg font-bold text-[var(--color--dark-blue)] mb-1">
                    So setzt sich dein Endkundenpreis zusammen
                  </h2>
                  <p className="text-sm text-[var(--color--dark-grey)] mb-5">
                    Der Börsenpreis ist nur ein Teil. Netz, Steuern, Abgaben und der Anbieter kommen dazu – plus 19% Mehrwertsteuer.
                  </p>

                  {/* Stacked Bar */}
                  <div className="mb-2">
                    <div className="flex h-12 w-full rounded-lg overflow-hidden shadow-sm">
                      {segments.map((seg) => (
                        <div
                          key={seg.label}
                          className="flex items-center justify-center text-white text-xs font-semibold transition-all"
                          style={{
                            width: `${(seg.value / totalForBar) * 100}%`,
                            backgroundColor: seg.color,
                            minWidth: '40px',
                          }}
                          title={`${seg.label}: ${seg.value.toFixed(2)} ct/kWh`}
                        >
                          {((seg.value / totalForBar) * 100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-[var(--color--dark-grey)] mt-1">
                      <span>0 ct</span>
                      <span className="font-bold text-[var(--color--dark-blue)]">
                        Gesamt: {breakdown.total.toFixed(1)} ct/kWh
                      </span>
                    </div>
                  </div>

                  {/* Component Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    {segments.map((seg) => (
                      <div
                        key={seg.label}
                        className="p-4 rounded-xl border-l-4"
                        style={{ borderColor: seg.color, backgroundColor: `${seg.color}10` }}
                      >
                        <div className="text-xs text-[var(--color--dark-grey)] mb-1">{seg.label}</div>
                        <div className="text-2xl font-bold" style={{ color: seg.color }}>
                          {seg.value.toFixed(2)}
                        </div>
                        <div className="text-xs text-[var(--color--dark-grey)] mb-1">ct/kWh</div>
                        <div className="text-xs text-[var(--color--dark-grey)] leading-tight">
                          {seg.description}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vergleich Festpreis */}
                  <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="text-sm text-[var(--color--dark-grey)] mb-1">Dein Preis aktuell (dynamisch)</div>
                        <div className="text-3xl font-bold text-[var(--color--dark-blue)]">
                          {breakdown.total.toFixed(1)} <span className="text-lg">ct/kWh</span>
                        </div>
                      </div>
                      <div className="hidden md:block text-2xl text-[var(--color--dark-grey)]">vs.</div>
                      <div>
                        <div className="text-sm text-[var(--color--dark-grey)] mb-1">Durchschnitt Festpreis</div>
                        <div className="text-3xl font-bold text-gray-400 line-through decoration-2">
                          {TYPICAL_FIXED_TARIFF.toFixed(1)} <span className="text-lg">ct/kWh</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${savings > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className={`text-xs font-semibold mb-0.5 ${savings > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {savings > 0 ? 'Du sparst gerade' : 'Aktuell teurer'}
                        </div>
                        <div className={`text-xl font-bold ${savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {savings > 0 ? '−' : '+'}{Math.abs(savings).toFixed(1)} ct/kWh
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--color--dark-grey)] mt-4 leading-relaxed">
                    <strong>Wichtig:</strong> Netzentgelte, Steuern und Abgaben sind bei jedem Stromtarif fast identisch –
                    sie machen zusammen rund {(FIXED_NET * (1 + VAT)).toFixed(1)} ct/kWh aus. Nur der Börsenpreis schwankt.
                    In günstigen Stunden (z.B. mittags bei Sonne oder nachts bei Wind) liegt dein Gesamtpreis deutlich unter dem Festpreis –
                    in teuren Stunden darüber. Wer Verbrauch verschieben kann (Wallbox, Wärmepumpe, Spülmaschine, Batterie), spart übers Jahr.
                  </p>
                </div>
              );
            })()}

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
