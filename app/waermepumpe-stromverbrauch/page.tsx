'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ── Data ──────────────────────────────────────────────────────────────────────

const WP_TYPES = [
  {
    value: 'luft',
    label: 'Luft-Wasser',
    description: 'Häufigste Bauart, JAZ Ø 3,4',
    jaz: 3.4,
  },
  {
    value: 'sole',
    label: 'Sole-Wasser',
    description: 'Erdwärme, JAZ Ø 4,3',
    jaz: 4.3,
  },
  {
    value: 'wasser',
    label: 'Wasser-Wasser',
    description: 'Grundwasser, JAZ Ø 4,5',
    jaz: 4.5,
  },
] as const;

type WpType = (typeof WP_TYPES)[number]['value'];

const GEBAEUDE_TYPES = [
  {
    value: 'neubau',
    label: 'Neubau / KfW 55+',
    description: 'Sehr gut gedämmt',
    wattsPerM2: 7,
    hours: 1500,
  },
  {
    value: 'saniert',
    label: 'Vollsaniert',
    description: 'KfW 70–100, gute Dämmung',
    wattsPerM2: 9,
    hours: 1800,
  },
  {
    value: 'teilsaniert',
    label: 'Teilsaniert',
    description: 'Teils gedämmt, Baujahr 1980–2000',
    wattsPerM2: 11,
    hours: 2000,
  },
  {
    value: 'unsaniert',
    label: 'Unsaniert / Altbau',
    description: 'Kaum Dämmung, vor 1980',
    wattsPerM2: 14,
    hours: 2200,
  },
] as const;

type GebaeudeType = (typeof GEBAEUDE_TYPES)[number]['value'];

// Monthly distribution weights (source: BDEW/Fraunhofer; normalised to sum = 100)
const MONTHLY_WEIGHTS = [18, 16, 12, 7, 3, 2, 1, 1, 4, 10, 12, 14]; // sum = 100

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
];

const WP_TARIF = 20.3; // ct/kWh (BDEW 04/2026)
const HAUSHALT_TARIF = 37.0; // ct/kWh (BDEW 04/2026)

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, digits = 0) {
  return n.toLocaleString('de-DE', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function fmtEuro(n: number) {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--w-surface)',
        border: '1px solid var(--w-border)',
        padding: '10px 14px',
        fontSize: 13,
        color: '#222',
      }}
    >
      <div className="font-semibold mb-1">{label}</div>
      <div>{fmt(payload[0].value)} kWh</div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--w-border)',
        background: 'white',
        padding: '24px',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6B7280' }}>
        {label}
      </p>
      <p className="text-3xl" style={{ fontWeight: 300, color: '#222222' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: '#8c8c8c' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WaermepumpeStromverbrauchPage() {
  const [flaeche, setFlaeche] = useState(140);
  const [gebaeudeType, setGebaeudeType] = useState<GebaeudeType>('teilsaniert');
  const [wpType, setWpType] = useState<WpType>('luft');
  const [customHeizleistung, setCustomHeizleistung] = useState('');
  const [strompreis, setStrompreis] = useState(WP_TARIF);
  const [useCustomStrompreis, setUseCustomStrompreis] = useState(false);

  const gebaeude = GEBAEUDE_TYPES.find((g) => g.value === gebaeudeType)!;
  const wp = WP_TYPES.find((w) => w.value === wpType)!;

  const results = useMemo(() => {
    const derivedHeizleistung = (flaeche * gebaeude.wattsPerM2) / 1000; // kW
    const heizleistung =
      customHeizleistung && parseFloat(customHeizleistung) > 0
        ? parseFloat(customHeizleistung)
        : derivedHeizleistung;

    const jahresverbrauch = (heizleistung * gebaeude.hours) / wp.jaz;

    const weightSum = MONTHLY_WEIGHTS.reduce((a, b) => a + b, 0);
    const monthlyKwh = MONTHLY_WEIGHTS.map((w) => (jahresverbrauch * w) / weightSum);

    // Daily averages for winter (Jan) and summer (Jul)
    const tagesWinter = monthlyKwh[0] / 31;
    const tagesSommer = monthlyKwh[6] / 31;

    const effStrompreis = useCustomStrompreis ? strompreis : strompreis;
    const jahreskosten = (jahresverbrauch * effStrompreis) / 100;
    const jahreskostenHaushalt = (jahresverbrauch * HAUSHALT_TARIF) / 100;
    const ersparnis = jahreskostenHaushalt - jahreskosten;

    const chartData = MONTH_LABELS.map((month, i) => ({
      month,
      kwh: Math.round(monthlyKwh[i]),
    }));

    return {
      heizleistung,
      derivedHeizleistung,
      jahresverbrauch,
      tagesWinter,
      tagesSommer,
      jahreskosten,
      jahreskostenHaushalt,
      ersparnis,
      chartData,
    };
  }, [flaeche, gebaeudeType, wpType, customHeizleistung, strompreis, useCustomStrompreis, gebaeude, wp]);

  const peakMonth = Math.max(...results.chartData.map((d) => d.kwh));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--w-surface)' }}>
      <Header currentPage="wp-rechner" />

      {/* Hero */}
      <section style={{ background: 'var(--w-blue)', color: 'white' }}>
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-white/70">
            42watt Tools · Wärmepumpe
          </p>
          <h1 className="text-3xl md:text-4xl mb-4 text-white" style={{ fontWeight: 300 }}>
            Wärmepumpen-Stromverbrauchsrechner
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-2xl leading-relaxed">
            Berechne den realen Jahresstromverbrauch deiner Wärmepumpe — basierend auf
            Wohnfläche, Gebäudetyp und Anlagenart. Mit echten JAZ-Werten aus der
            Fraunhofer-ISE-Studie 11/2025 und monatlicher Verteilung.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto w-full px-4 py-10 md:py-14 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Inputs ── */}
          <div className="lg:col-span-1 space-y-8">

            {/* Wohnfläche */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>
                  Wohnfläche
                </label>
                <span className="text-lg font-semibold" style={{ color: 'var(--w-blue)' }}>
                  {flaeche} m²
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={400}
                step={5}
                value={flaeche}
                onChange={(e) => setFlaeche(Number(e.target.value))}
                className="w-full accent-[var(--w-blue)]"
                style={{ accentColor: 'var(--w-blue)' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#bababa' }}>
                <span>40 m²</span>
                <span>400 m²</span>
              </div>
            </div>

            {/* Gebäudetyp */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                Gebäudetyp / Dämmstandard
              </p>
              <div className="space-y-2">
                {GEBAEUDE_TYPES.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGebaeudeType(g.value)}
                    className="w-full p-3 text-left transition-colors"
                    style={{
                      border: `1px solid ${gebaeudeType === g.value ? 'var(--w-blue)' : 'var(--w-border)'}`,
                      background: gebaeudeType === g.value ? 'rgba(52, 69, 255, 0.05)' : 'white',
                      borderRadius: 0,
                    }}
                  >
                    <span
                      className="block text-sm font-semibold"
                      style={{ color: gebaeudeType === g.value ? 'var(--w-blue)' : '#222' }}
                    >
                      {g.label}
                    </span>
                    <span className="text-xs" style={{ color: '#8c8c8c' }}>
                      {g.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* WP-Typ */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                Wärmepumpentyp
              </p>
              <div className="space-y-2">
                {WP_TYPES.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setWpType(w.value)}
                    className="w-full p-3 text-left transition-colors"
                    style={{
                      border: `1px solid ${wpType === w.value ? 'var(--w-blue)' : 'var(--w-border)'}`,
                      background: wpType === w.value ? 'rgba(52, 69, 255, 0.05)' : 'white',
                      borderRadius: 0,
                    }}
                  >
                    <span
                      className="block text-sm font-semibold"
                      style={{ color: wpType === w.value ? 'var(--w-blue)' : '#222' }}
                    >
                      {w.label}
                    </span>
                    <span className="text-xs" style={{ color: '#8c8c8c' }}>
                      {w.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional: Heizleistung */}
            <div>
              <label
                htmlFor="heizleistung"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#6B7280' }}
              >
                Heizleistung (optional)
              </label>
              <div className="relative">
                <input
                  id="heizleistung"
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  placeholder={`${fmt(results.derivedHeizleistung, 1)} kW (geschätzt)`}
                  value={customHeizleistung}
                  onChange={(e) => setCustomHeizleistung(e.target.value)}
                  className="w-full px-4 py-3 text-sm outline-none transition-colors pr-12"
                  style={{
                    border: '1px solid var(--w-border)',
                    background: 'white',
                    color: '#222',
                    borderRadius: 0,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--w-blue)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--w-border)')}
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#8c8c8c' }}
                >
                  kW
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#bababa' }}>
                Leer lassen = wird automatisch aus Fläche + Gebäudetyp berechnet
              </p>
            </div>

            {/* Strompreis */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                Strompreis
              </p>
              <div className="space-y-2 mb-3">
                {[
                  { label: 'WP-Sondertarif', sub: 'Ø 20,3 ct/kWh (BDEW 04/2026)', val: WP_TARIF },
                  { label: 'Haushaltsstrom', sub: 'Ø 37,0 ct/kWh (BDEW 04/2026)', val: HAUSHALT_TARIF },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setStrompreis(opt.val);
                      setUseCustomStrompreis(false);
                    }}
                    className="w-full p-3 text-left transition-colors"
                    style={{
                      border: `1px solid ${!useCustomStrompreis && strompreis === opt.val ? 'var(--w-blue)' : 'var(--w-border)'}`,
                      background:
                        !useCustomStrompreis && strompreis === opt.val
                          ? 'rgba(52, 69, 255, 0.05)'
                          : 'white',
                      borderRadius: 0,
                    }}
                  >
                    <span
                      className="block text-sm font-semibold"
                      style={{
                        color:
                          !useCustomStrompreis && strompreis === opt.val ? 'var(--w-blue)' : '#222',
                      }}
                    >
                      {opt.label}
                    </span>
                    <span className="text-xs" style={{ color: '#8c8c8c' }}>
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={80}
                  step={0.1}
                  placeholder="Eigener Preis"
                  value={useCustomStrompreis ? strompreis : ''}
                  onChange={(e) => {
                    setUseCustomStrompreis(true);
                    setStrompreis(parseFloat(e.target.value) || WP_TARIF);
                  }}
                  onFocus={() => setUseCustomStrompreis(true)}
                  className="w-full px-4 py-3 text-sm outline-none transition-colors pr-16"
                  style={{
                    border: `1px solid ${useCustomStrompreis ? 'var(--w-blue)' : 'var(--w-border)'}`,
                    background: useCustomStrompreis ? 'rgba(52, 69, 255, 0.03)' : 'white',
                    color: '#222',
                    borderRadius: 0,
                  }}
                  onBlur={(e) =>
                    !useCustomStrompreis && (e.target.style.borderColor = 'var(--w-border)')
                  }
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#8c8c8c' }}
                >
                  ct/kWh
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard
                label="Jahresverbrauch"
                value={`${fmt(results.jahresverbrauch)} kWh`}
                sub={`JAZ ${wp.jaz.toFixed(1)}`}
              />
              <KpiCard
                label="Jahreskosten"
                value={fmtEuro(results.jahreskosten)}
                sub={`bei ${fmt(strompreis, 1)} ct/kWh`}
              />
              <KpiCard
                label="Ø Wintertag"
                value={`${fmt(results.tagesWinter, 1)} kWh`}
                sub="Januar"
              />
              <KpiCard
                label="Ø Sommertag"
                value={`${fmt(results.tagesSommer, 1)} kWh`}
                sub="Juli"
              />
            </div>

            {/* Heizleistung info */}
            <div
              className="px-4 py-3 text-sm flex items-center gap-2"
              style={{ background: 'rgba(52,69,255,0.06)', border: '1px solid rgba(52,69,255,0.15)' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--w-blue)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ color: '#374151' }}>
                Geschätzte Heizleistung:{' '}
                <strong>{fmt(results.heizleistung, 1)} kW</strong> für {flaeche} m² ({gebaeude.label}) ·{' '}
                {gebaeude.hours} Volllaststunden/Jahr
              </span>
            </div>

            {/* Monthly Bar Chart */}
            <div style={{ border: '1px solid var(--w-border)', background: 'white' }}>
              <div className="px-6 pt-5 pb-2">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#6B7280' }}>
                  Monatlicher Stromverbrauch
                </p>
                <p className="text-xs" style={{ color: '#8c8c8c' }}>
                  Verbrauch in kWh — typische saisonale Verteilung für {gebaeude.label.toLowerCase()}e Gebäude
                </p>
              </div>
              <div className="px-2 pb-5" style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#E5E0D7" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#8c8c8c' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#8c8c8c' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(52,69,255,0.04)' }} />
                    <Bar dataKey="kwh" radius={0}>
                      {results.chartData.map((entry) => (
                        <Cell
                          key={entry.month}
                          fill={
                            entry.kwh === peakMonth
                              ? 'var(--w-blue)'
                              : entry.kwh < peakMonth * 0.15
                              ? '#BDD9C4'
                              : 'rgba(52,69,255,0.35)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Table */}
            <div style={{ border: '1px solid var(--w-border)', background: 'white' }}>
              <div className="px-6 pt-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#6B7280' }}>
                  Kostenvergleich Stromtarife
                </p>
                <div className="divide-y" style={{ borderColor: 'var(--w-border)' }}>
                  {[
                    {
                      label: 'WP-Sondertarif',
                      preis: WP_TARIF,
                      kosten: (results.jahresverbrauch * WP_TARIF) / 100,
                      highlight: true,
                    },
                    {
                      label: 'Haushaltsstrom',
                      preis: HAUSHALT_TARIF,
                      kosten: results.jahreskostenHaushalt,
                      highlight: false,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="py-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-semibold" style={{ color: row.highlight ? 'var(--w-blue)' : '#222' }}>
                          {row.label}
                        </span>
                        <span className="text-xs ml-2" style={{ color: '#8c8c8c' }}>
                          {fmt(row.preis, 1)} ct/kWh
                        </span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums" style={{ color: '#222' }}>
                        {fmtEuro(row.kosten)}/Jahr
                      </span>
                    </div>
                  ))}
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: '#222' }}>
                      Ersparnis mit WP-Tarif
                    </span>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: results.ersparnis > 0 ? '#16a34a' : '#dc2626' }}
                    >
                      {results.ersparnis > 0 ? '–' : '+'}{fmtEuro(Math.abs(results.ersparnis))}/Jahr
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Detail Table */}
            <div style={{ border: '1px solid var(--w-border)', background: 'white' }}>
              <div className="px-6 pt-5 pb-2">
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#6B7280' }}>
                  Monatliche Aufschlüsselung
                </p>
              </div>
              <div className="px-6 pb-5">
                <div
                  className="grid grid-cols-4 text-xs font-semibold uppercase tracking-wider pb-2 mb-2"
                  style={{ borderBottom: '1px solid var(--w-border)', color: '#6B7280' }}
                >
                  <span>Monat</span>
                  <span className="text-right">Verbrauch</span>
                  <span className="text-right">WP-Tarif</span>
                  <span className="text-right">Haushalt</span>
                </div>
                <div className="space-y-0">
                  {results.chartData.map((row) => {
                    const kostenWp = (row.kwh * WP_TARIF) / 100;
                    const kostenHh = (row.kwh * HAUSHALT_TARIF) / 100;
                    return (
                      <div
                        key={row.month}
                        className="grid grid-cols-4 py-2 text-sm"
                        style={{ borderBottom: '1px solid var(--w-border)' }}
                      >
                        <span style={{ color: '#222' }}>{row.month}</span>
                        <span className="text-right tabular-nums" style={{ color: '#222' }}>
                          {fmt(row.kwh)} kWh
                        </span>
                        <span className="text-right tabular-nums" style={{ color: '#222' }}>
                          {fmtEuro(kostenWp)}
                        </span>
                        <span className="text-right tabular-nums" style={{ color: '#8c8c8c' }}>
                          {fmtEuro(kostenHh)}
                        </span>
                      </div>
                    );
                  })}
                  <div
                    className="grid grid-cols-4 py-2 text-sm font-semibold"
                    style={{ color: '#222' }}
                  >
                    <span>Gesamt</span>
                    <span className="text-right tabular-nums">
                      {fmt(results.jahresverbrauch)} kWh
                    </span>
                    <span className="text-right tabular-nums" style={{ color: 'var(--w-blue)' }}>
                      {fmtEuro((results.jahresverbrauch * WP_TARIF) / 100)}
                    </span>
                    <span className="text-right tabular-nums" style={{ color: '#8c8c8c' }}>
                      {fmtEuro(results.jahreskostenHaushalt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Methodology Note */}
            <div
              className="px-5 py-4 text-xs leading-relaxed"
              style={{ border: '1px solid var(--w-border)', background: 'white', color: '#8c8c8c' }}
            >
              <p className="font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7280', fontSize: 10 }}>
                Methodik & Quellen
              </p>
              <p>
                Jahresarbeitszahlen (JAZ) nach Fraunhofer ISE Wärmepumpen-Monitoring, November 2025:
                Luft-Wasser Ø 3,4 · Sole-Wasser Ø 4,3 · Wasser-Wasser Ø 4,5.
                Heizleistungsdichte aus EnEV/GEG-Kennwerten (7–14 W/m²). Volllaststunden
                orientieren sich an DIN EN 12831 und BDEW-Statistiken.
                Strompreise: BDEW-Haushaltsstrompreis April 2026 (37,0 ct/kWh) und
                WP-Sondertarif-Benchmark (20,3 ct/kWh). Die Ergebnisse sind Richtwerte —
                der tatsächliche Verbrauch hängt von Nutzungsverhalten, Warmwasserbereitung
                und lokalen Klimabedingungen ab.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
