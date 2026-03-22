'use client';

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface PVInputs {
  investmentCosts: number;
  maintenanceCosts: number;
  annualYield: number;
  electricityPrice: number;
  electricityPriceIncrease: number;
  selfConsumptionRate: number;
  feedInTariff: number;
  observationPeriod: number;
}

interface YearlyData {
  year: number;
  electricityPrice: number;
  selfConsumptionSavings: number;
  feedInRevenue: number;
  totalRevenue: number;
  cumulativeRevenue: number;
  netProfit: number;
}

function calculateInvestment(inputs: PVInputs): {
  yearlyData: YearlyData[];
  breakEvenYear: number;
  totalReturn: number;
  netProfit: number;
  annualReturn: number;
} {
  const yearlyData: YearlyData[] = [];
  let cumulativeRevenue = 0;
  let breakEvenYear = inputs.observationPeriod + 1;
  let breakEvenFound = false;

  for (let year = 1; year <= inputs.observationPeriod; year++) {
    const priceMultiplier = Math.pow(1 + inputs.electricityPriceIncrease / 100, year - 1);
    const currentElectricityPrice = inputs.electricityPrice * priceMultiplier;

    const selfConsumptionKwh = inputs.annualYield * (inputs.selfConsumptionRate / 100);
    const feedInKwh = inputs.annualYield * (1 - inputs.selfConsumptionRate / 100);

    const selfConsumptionSavings = selfConsumptionKwh * (currentElectricityPrice / 100);
    const feedInRevenue = feedInKwh * (inputs.feedInTariff / 100);
    const totalRevenue = selfConsumptionSavings + feedInRevenue - inputs.maintenanceCosts;

    cumulativeRevenue += totalRevenue;

    if (!breakEvenFound && cumulativeRevenue >= inputs.investmentCosts) {
      // Linear interpolation for more precise break-even
      const prevCumulative = cumulativeRevenue - totalRevenue;
      const remaining = inputs.investmentCosts - prevCumulative;
      breakEvenYear = Math.round((year - 1 + remaining / totalRevenue) * 10) / 10;
      breakEvenFound = true;
    }

    yearlyData.push({
      year,
      electricityPrice: Math.round(currentElectricityPrice * 10) / 10,
      selfConsumptionSavings: Math.round(selfConsumptionSavings),
      feedInRevenue: Math.round(feedInRevenue),
      totalRevenue: Math.round(totalRevenue),
      cumulativeRevenue: Math.round(cumulativeRevenue),
      netProfit: Math.round(cumulativeRevenue - inputs.investmentCosts),
    });
  }

  const netProfit = Math.round(cumulativeRevenue - inputs.investmentCosts);
  const totalReturn = inputs.investmentCosts > 0
    ? Math.round((netProfit / inputs.investmentCosts) * 1000) / 10
    : 0;
  const annualReturn = inputs.observationPeriod > 0 && inputs.investmentCosts > 0
    ? Math.round((totalReturn / inputs.observationPeriod) * 10) / 10
    : 0;

  return {
    yearlyData,
    breakEvenYear: breakEvenFound ? breakEvenYear : inputs.observationPeriod + 1,
    totalReturn,
    netProfit,
    annualReturn,
  };
}

function SimpleChart({ data, investmentCosts }: { data: YearlyData[]; investmentCosts: number }) {
  if (data.length === 0) return null;

  const maxCumulative = Math.max(...data.map(d => d.cumulativeRevenue));
  const chartMax = Math.max(maxCumulative, investmentCosts) * 1.1;
  const chartMin = 0;
  const range = chartMax - chartMin;

  const width = 100;
  const height = 50;
  const padLeft = 0;
  const padRight = 2;
  const padTop = 2;
  const padBottom = 6;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const toX = (i: number) => padLeft + (i / (data.length - 1)) * plotW;
  const toY = (v: number) => padTop + plotH - ((v - chartMin) / range) * plotH;

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.cumulativeRevenue).toFixed(1)}`)
    .join(' ');

  const investY = toY(investmentCosts);

  // Y-axis labels
  const ySteps = 5;
  const yLabels = [];
  for (let i = 0; i <= ySteps; i++) {
    const val = chartMin + (range / ySteps) * i;
    yLabels.push({ val, y: toY(val) });
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-[var(--color--dark-blue)] mb-4">
        Kumulierte Netto-Ersparnis vs. Investition
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={i}
            x1={padLeft}
            x2={width - padRight}
            y1={label.y}
            y2={label.y}
            stroke="#e5e5e5"
            strokeWidth="0.15"
          />
        ))}

        {/* Investment line (dashed) */}
        <line
          x1={padLeft}
          x2={width - padRight}
          y1={investY}
          y2={investY}
          stroke="#ef4444"
          strokeWidth="0.3"
          strokeDasharray="1.5,1"
        />
        <text
          x={width - padRight}
          y={investY - 0.8}
          textAnchor="end"
          fontSize="2.2"
          fill="#ef4444"
          fontWeight="600"
        >
          Investition {investmentCosts.toLocaleString('de-DE')} €
        </text>

        {/* Area fill */}
        <path
          d={`${linePath} L${toX(data.length - 1).toFixed(1)},${toY(0).toFixed(1)} L${toX(0).toFixed(1)},${toY(0).toFixed(1)} Z`}
          fill="rgba(52, 69, 255, 0.08)"
        />

        {/* Line */}
        <path d={linePath} fill="none" stroke="var(--color--light-blue)" strokeWidth="0.5" strokeLinejoin="round" />

        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(d.cumulativeRevenue)}
            r="0.6"
            fill="var(--color--light-blue)"
          />
        ))}

        {/* X-axis labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 10) === 0 || i === data.length - 1).map((d, i) => (
          <text
            key={i}
            x={toX(data.indexOf(d))}
            y={height - 1}
            textAnchor="middle"
            fontSize="2.2"
            fill="var(--color--dark-grey)"
          >
            {d.year}
          </text>
        ))}

        {/* Y-axis labels */}
        {yLabels.filter((_, i) => i % 2 === 0 || i === yLabels.length - 1).map((label, i) => (
          <text
            key={i}
            x={padLeft + 0.5}
            y={label.y - 0.5}
            fontSize="1.8"
            fill="var(--color--dark-grey)"
          >
            {label.val >= 1000 ? `${Math.round(label.val / 1000)}k` : Math.round(label.val)}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-6 mt-3 text-xs text-[var(--color--dark-grey)]">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[var(--color--light-blue)] inline-block rounded"></span>
          Kumulierte Netto-Ersparnis
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-red-500 inline-block rounded" style={{ borderTop: '2px dashed #ef4444', height: 0 }}></span>
          Investitionskosten
        </span>
      </div>
    </div>
  );
}

export default function PVInvestitionsrechner() {
  const [inputs, setInputs] = useState<PVInputs>({
    investmentCosts: 15000,
    maintenanceCosts: 280,
    annualYield: 9500,
    electricityPrice: 34,
    electricityPriceIncrease: 2.0,
    selfConsumptionRate: 35,
    feedInTariff: 8.1,
    observationPeriod: 25,
  });

  const results = useMemo(() => calculateInvestment(inputs), [inputs]);

  const handleChange = (field: keyof PVInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--color--light-grey)] flex flex-col">
      <Header currentPage="pv-investition" />

      <main>
      {/* Title */}
      <div className="bg-[var(--color--light-blue)] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Photovoltaik-Investition bewerten
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
            Diese Seite hilft dir, Photovoltaik-Kosten als Investitionsentscheidung fundiert zu bewerten.
            Sieh sofort Break-Even, Rendite und Amortisation und simuliere
            Strompreisentwicklung sowie Szenarien transparent auf belastbarer Datengrundlage.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-[var(--color--dark-blue)] mb-6">
                Deine Anlagendaten
              </h2>

              <div className="space-y-5">
                {/* Investitionskosten */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                    Investitionskosten
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs.investmentCosts}
                      onChange={e => handleChange('investmentCosts', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border-2 border-[var(--color--medium-grey)] rounded-lg focus:border-[var(--color--light-blue)] focus:outline-none pr-14"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color--dark-grey)]">EUR</span>
                  </div>
                </div>

                {/* PV-Anlagen Nebenkosten */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                    PV-Anlagen Nebenkosten
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs.maintenanceCosts}
                      onChange={e => handleChange('maintenanceCosts', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border-2 border-[var(--color--medium-grey)] rounded-lg focus:border-[var(--color--light-blue)] focus:outline-none pr-20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color--dark-grey)]">EUR/Jahr</span>
                  </div>
                </div>

                {/* Geschätzter Jahresertrag */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                    Geschätzter Jahresertrag
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs.annualYield}
                      onChange={e => handleChange('annualYield', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border-2 border-[var(--color--medium-grey)] rounded-lg focus:border-[var(--color--light-blue)] focus:outline-none pr-20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color--dark-grey)]">kWh/Jahr</span>
                  </div>
                </div>

                <div className="border-t border-[var(--color--medium-grey)] pt-5">
                  {/* Aktueller Strompreis */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                      Aktueller Strompreis
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.electricityPrice}
                        onChange={e => handleChange('electricityPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 border-2 border-[var(--color--medium-grey)] rounded-lg focus:border-[var(--color--light-blue)] focus:outline-none pr-16"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color--dark-grey)]">ct/kWh</span>
                    </div>
                  </div>

                  {/* Jährliche Strompreissteigerung */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                      Jährliche Strompreissteigerung: {inputs.electricityPriceIncrease.toFixed(1)} %
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.1"
                      value={inputs.electricityPriceIncrease}
                      onChange={e => handleChange('electricityPriceIncrease', parseFloat(e.target.value))}
                      className="w-full h-2 bg-[var(--color--medium-grey)] rounded-lg appearance-none cursor-pointer accent-[var(--color--light-blue)]"
                    />
                  </div>

                  {/* Eigenverbrauchsanteil */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                      Eigenverbrauchsanteil: {inputs.selfConsumptionRate.toFixed(1)} %
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="0.5"
                      value={inputs.selfConsumptionRate}
                      onChange={e => handleChange('selfConsumptionRate', parseFloat(e.target.value))}
                      className="w-full h-2 bg-[var(--color--medium-grey)] rounded-lg appearance-none cursor-pointer accent-[var(--color--light-blue)]"
                    />
                  </div>

                  {/* Einspeisevergütung */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                      Einspeisevergütung
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.feedInTariff}
                        onChange={e => handleChange('feedInTariff', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 border-2 border-[var(--color--medium-grey)] rounded-lg focus:border-[var(--color--light-blue)] focus:outline-none pr-16"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color--dark-grey)]">ct/kWh</span>
                    </div>
                  </div>

                  {/* Betrachtungszeitraum */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color--black)] mb-1.5">
                      Betrachtungszeitraum: {inputs.observationPeriod} Jahre
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      step="1"
                      value={inputs.observationPeriod}
                      onChange={e => handleChange('observationPeriod', parseInt(e.target.value))}
                      className="w-full h-2 bg-[var(--color--medium-grey)] rounded-lg appearance-none cursor-pointer accent-[var(--color--light-blue)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                <div className="text-sm text-[var(--color--dark-grey)] mb-1">Break-Even</div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--color--light-blue)]">
                  {results.breakEvenYear <= inputs.observationPeriod
                    ? `${results.breakEvenYear} Jahre`
                    : `>${inputs.observationPeriod} J.`}
                </div>
                <div className="text-xs text-[var(--color--dark-grey)] mt-1">Ab dann verdienst du</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                <div className="text-sm text-[var(--color--dark-grey)] mb-1">Gesamtrendite</div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--color--green)]">
                  {results.totalReturn.toLocaleString('de-DE')} %
                </div>
                <div className="text-xs text-[var(--color--dark-grey)] mt-1">Über {inputs.observationPeriod} Jahre</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                <div className="text-sm text-[var(--color--dark-grey)] mb-1">Nettogewinn</div>
                <div className={`text-3xl md:text-4xl font-bold ${results.netProfit >= 0 ? 'text-[var(--color--green)]' : 'text-red-500'}`}>
                  {results.netProfit.toLocaleString('de-DE')} €
                </div>
                <div className="text-xs text-[var(--color--dark-grey)] mt-1">über {inputs.observationPeriod} Jahre (inkl. Unterhalt)</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                <div className="text-sm text-[var(--color--dark-grey)] mb-1">Jährliche Rendite</div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--color--light-blue)]">
                  {results.annualReturn.toLocaleString('de-DE')} %
                </div>
                <div className="text-xs text-[var(--color--dark-grey)] mt-1">annualisiert</div>
              </div>
            </div>

            {/* Chart */}
            <SimpleChart data={results.yearlyData} investmentCosts={inputs.investmentCosts} />

            {/* Yearly Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--color--dark-blue)] mb-4">
                Jährliche Entwicklung
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[var(--color--medium-grey)]">
                      <th className="text-left py-2 px-2 font-semibold">Jahr</th>
                      <th className="text-right py-2 px-2 font-semibold">Strompreis</th>
                      <th className="text-right py-2 px-2 font-semibold">Eigenverbrauch</th>
                      <th className="text-right py-2 px-2 font-semibold">Einspeisung</th>
                      <th className="text-right py-2 px-2 font-semibold">Netto/Jahr</th>
                      <th className="text-right py-2 px-2 font-semibold">Kumuliert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearlyData.map((row, i) => (
                      <tr
                        key={row.year}
                        className={`border-b border-[var(--color--light-grey)] ${i % 2 === 0 ? 'bg-[var(--color--light-grey)] bg-opacity-30' : ''}`}
                      >
                        <td className="py-2 px-2 font-semibold">{row.year}</td>
                        <td className="text-right py-2 px-2">{row.electricityPrice} ct</td>
                        <td className="text-right py-2 px-2 text-[var(--color--green)]">{row.selfConsumptionSavings.toLocaleString('de-DE')} €</td>
                        <td className="text-right py-2 px-2">{row.feedInRevenue.toLocaleString('de-DE')} €</td>
                        <td className="text-right py-2 px-2 font-semibold">{row.totalRevenue.toLocaleString('de-DE')} €</td>
                        <td className={`text-right py-2 px-2 font-bold ${row.netProfit >= 0 ? 'text-[var(--color--green)]' : 'text-red-500'}`}>
                          {row.netProfit.toLocaleString('de-DE')} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-section mt-8">
          <div className="disclaimer-icon">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="disclaimer-text">
            Dieser Rechner liefert unverbindliche Schätzwerte auf Basis deiner Eingaben und ist keine Anlage-, Finanz-, Steuer- oder Rechtsberatung. Tatsächliche Erträge und Wirtschaftlichkeit können u. a. durch Verschattung, Witterung, Modulalterung, laufende Unterhaltskosten und individuelle Projektbedingungen abweichen.
          </p>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
