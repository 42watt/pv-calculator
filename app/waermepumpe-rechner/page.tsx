'use client';

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ============================================================
// Types
// ============================================================

type HeatingSystem = 'gas' | 'oil' | 'nachtspeicher' | 'fernwaerme';
type BuildingType = 'unsaniert' | 'teilsaniert' | 'saniert' | 'neubau';

interface Inputs {
  livingArea: number;
  buildingType: BuildingType;
  oldSystem: HeatingSystem;
  energyConsumption: number;
  wpInvestment: number;
  wpElectricityPrice: number;
  oldEnergyPrice: number;
  priceIncrease: number;
}

interface ExpertInputs {
  jaz: number;
  oldEfficiency: number;
  wpMaintenance: number;
  oldMaintenance: number;
  oldHilfsenergie: number;
  stromPreisSteigerung: number;
  observationPeriod: number;
  additionalCosts: number;
  co2PriceIncrease: number;
}

interface YearlyResult {
  year: number;
  oldCosts: number;
  wpCosts: number;
  savings: number;
  cumulativeSavings: number;
  netProfit: number;
}

// ============================================================
// Data & Defaults
// ============================================================

const buildingLabels: Record<BuildingType, string> = {
  unsaniert: 'Unsanierter Altbau (vor 1978)',
  teilsaniert: 'Teilsanierter Altbau',
  saniert: 'Gut saniert (KfW 100/EnEV)',
  neubau: 'Neubau (KfW 55/GEG 2024)',
};

const buildingKwhM2: Record<BuildingType, number> = {
  unsaniert: 160,
  teilsaniert: 140,
  saniert: 100,
  neubau: 50,
};

const buildingJAZ: Record<BuildingType, number> = {
  unsaniert: 2.7,
  teilsaniert: 3.2,
  saniert: 3.5,
  neubau: 4.0,
};

const systemLabels: Record<HeatingSystem, string> = {
  gas: 'Gasheizung (Brennwert)',
  oil: 'Ölheizung (Brennwert)',
  nachtspeicher: 'Nachtspeicherheizung',
  fernwaerme: 'Fernwärme',
};

const systemDefaults: Record<HeatingSystem, {
  energyPrice: number;
  efficiency: number;
  maintenance: number;
  hilfsenergie: number;
  priceIncrease: number;
  co2Factor: number;
}> = {
  gas: { energyPrice: 11.0, efficiency: 0.90, maintenance: 220, hilfsenergie: 250, priceIncrease: 5.0, co2Factor: 0.2016 },
  oil: { energyPrice: 10.0, efficiency: 0.88, maintenance: 300, hilfsenergie: 250, priceIncrease: 5.0, co2Factor: 0.2664 },
  nachtspeicher: { energyPrice: 38.0, efficiency: 0.95, maintenance: 0, hilfsenergie: 0, priceIncrease: 3.0, co2Factor: 0.380 },
  fernwaerme: { energyPrice: 16.0, efficiency: 0.88, maintenance: 0, hilfsenergie: 0, priceIncrease: 4.0, co2Factor: 0.180 },
};

const systemInvestment: Record<HeatingSystem, number> = {
  gas: 12000,
  oil: 11000,
  nachtspeicher: 10000,
  fernwaerme: 10000,
};

// ============================================================
// Calculation
// ============================================================

function calculate(inputs: Inputs, expert: ExpertInputs): {
  yearly: YearlyResult[];
  breakEvenYear: number;
  totalSavings: number;
  co2Saved: number;
  investmentDifference: number;
  oldSystemCostTotal: number;
  wpCostTotal: number;
} {
  const yearly: YearlyResult[] = [];
  let cumulativeSavings = 0;
  let breakEvenYear = expert.observationPeriod + 1;
  let breakEvenFound = false;

  const sysDefaults = systemDefaults[inputs.oldSystem];
  const investmentDifference = inputs.wpInvestment + expert.additionalCosts - systemInvestment[inputs.oldSystem];

  let oldCostTotal = 0;
  let wpCostTotal = 0;

  for (let year = 1; year <= expert.observationPeriod; year++) {
    // Old system costs
    const oldPriceMultiplier = Math.pow(1 + inputs.priceIncrease / 100, year - 1);
    const currentOldPrice = inputs.oldEnergyPrice * oldPriceMultiplier;
    const oldEnergyCost = (inputs.energyConsumption / expert.oldEfficiency) * (currentOldPrice / 100);
    const oldHilfsCost = expert.oldHilfsenergie * (inputs.wpElectricityPrice / 100) * Math.pow(1 + expert.stromPreisSteigerung / 100, year - 1);
    const oldTotal = oldEnergyCost + expert.oldMaintenance + oldHilfsCost;

    // WP costs
    const wpPriceMultiplier = Math.pow(1 + expert.stromPreisSteigerung / 100, year - 1);
    const currentWPPrice = inputs.wpElectricityPrice * wpPriceMultiplier;
    const wpEnergyNeeded = inputs.energyConsumption / expert.jaz;
    const wpEnergyCost = wpEnergyNeeded * (currentWPPrice / 100);
    const wpTotal = wpEnergyCost + expert.wpMaintenance;

    const savings = oldTotal - wpTotal;
    cumulativeSavings += savings;

    const netProfit = cumulativeSavings - investmentDifference;

    if (!breakEvenFound && netProfit >= 0) {
      const prevCum = cumulativeSavings - savings;
      const prevNet = prevCum - investmentDifference;
      const remaining = -prevNet;
      breakEvenYear = Math.round((year - 1 + remaining / savings) * 10) / 10;
      breakEvenFound = true;
    }

    oldCostTotal += oldTotal;
    wpCostTotal += wpTotal;

    yearly.push({
      year,
      oldCosts: Math.round(oldTotal),
      wpCosts: Math.round(wpTotal),
      savings: Math.round(savings),
      cumulativeSavings: Math.round(cumulativeSavings),
      netProfit: Math.round(netProfit),
    });
  }

  // CO2 saved over observation period
  const co2OldPerYear = (inputs.energyConsumption / expert.oldEfficiency) * sysDefaults.co2Factor;
  const co2WPPerYear = (inputs.energyConsumption / expert.jaz) * 0.380; // German electricity mix
  const co2Saved = Math.round((co2OldPerYear - co2WPPerYear) * expert.observationPeriod / 1000 * 10) / 10; // tonnes

  return {
    yearly,
    breakEvenYear: breakEvenFound ? breakEvenYear : expert.observationPeriod + 1,
    totalSavings: Math.round(cumulativeSavings - investmentDifference),
    co2Saved: Math.max(0, co2Saved),
    investmentDifference,
    oldSystemCostTotal: Math.round(oldCostTotal),
    wpCostTotal: Math.round(wpCostTotal),
  };
}

// ============================================================
// Chart Component
// ============================================================

function AmortisationChart({ data, investmentDiff }: { data: YearlyResult[]; investmentDiff: number }) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.cumulativeSavings), investmentDiff);
  const minVal = Math.min(0, ...data.map(d => d.cumulativeSavings));
  const chartMax = maxVal * 1.1;
  const chartMin = minVal * 1.1 || 0;
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
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.cumulativeSavings).toFixed(1)}`)
    .join(' ');

  const investY = toY(investmentDiff);

  const ySteps = 5;
  const yLabels = [];
  for (let i = 0; i <= ySteps; i++) {
    const val = chartMin + (range / ySteps) * i;
    yLabels.push({ val, y: toY(val) });
  }

  return (
    <div className="border border-[var(--w-border)] p-6 bg-white">
      <h3 className="text-lg font-medium text-[#222222] mb-4">
        Kumulierte Ersparnis vs. Mehrinvestition
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {yLabels.map((label, i) => (
          <line key={i} x1={padLeft} x2={width - padRight} y1={label.y} y2={label.y} stroke="#E5E0D7" strokeWidth="0.15" />
        ))}

        <line x1={padLeft} x2={width - padRight} y1={investY} y2={investY} stroke="#ef4444" strokeWidth="0.3" strokeDasharray="1.5,1" />
        <text x={width - padRight} y={investY - 0.8} textAnchor="end" fontSize="2.2" fill="#ef4444" fontWeight="600">
          Mehrinvestition {investmentDiff.toLocaleString('de-DE')} €
        </text>

        <path
          d={`${linePath} L${toX(data.length - 1).toFixed(1)},${toY(0).toFixed(1)} L${toX(0).toFixed(1)},${toY(0).toFixed(1)} Z`}
          fill="rgba(52, 69, 255, 0.08)"
        />

        <path d={linePath} fill="none" stroke="var(--w-blue)" strokeWidth="0.5" strokeLinejoin="round" />

        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.cumulativeSavings)} r="0.6" fill="var(--w-blue)" />
        ))}

        {data.filter((_, i) => i % Math.ceil(data.length / 10) === 0 || i === data.length - 1).map((d) => (
          <text key={d.year} x={toX(data.indexOf(d))} y={height - 1} textAnchor="middle" fontSize="2.2" fill="#888888">
            {d.year}
          </text>
        ))}

        {yLabels.filter((_, i) => i % 2 === 0 || i === yLabels.length - 1).map((label, i) => (
          <text key={i} x={padLeft + 0.5} y={label.y - 0.5} fontSize="1.8" fill="#888888">
            {Math.abs(label.val) >= 1000 ? `${Math.round(label.val / 1000)}k` : Math.round(label.val)}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-6 mt-3 text-xs text-[#888888]">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[var(--w-blue)] inline-block"></span>
          Kumulierte Betriebskostenersparnis
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-red-500 inline-block" style={{ borderTop: '2px dashed #ef4444', height: 0 }}></span>
          Mehrinvestition WP
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function WaermepumpeRechner() {
  const [showExpert, setShowExpert] = useState(false);

  const [inputs, setInputs] = useState<Inputs>({
    livingArea: 130,
    buildingType: 'teilsaniert',
    oldSystem: 'gas',
    energyConsumption: 18200,
    wpInvestment: 33000,
    wpElectricityPrice: 25.0,
    oldEnergyPrice: 11.0,
    priceIncrease: 5.0,
  });

  const [expert, setExpert] = useState<ExpertInputs>({
    jaz: 3.2,
    oldEfficiency: 0.90,
    wpMaintenance: 200,
    oldMaintenance: 220,
    oldHilfsenergie: 250,
    stromPreisSteigerung: 3.0,
    observationPeriod: 20,
    additionalCosts: 0,
    co2PriceIncrease: 5.0,
  });

  // Auto-calculate energy consumption from area + building type
  const handleBuildingChange = (type: BuildingType) => {
    const consumption = inputs.livingArea * buildingKwhM2[type];
    const jaz = buildingJAZ[type];
    setInputs(prev => ({ ...prev, buildingType: type, energyConsumption: consumption }));
    setExpert(prev => ({ ...prev, jaz }));
  };

  const handleAreaChange = (area: number) => {
    const consumption = area * buildingKwhM2[inputs.buildingType];
    setInputs(prev => ({ ...prev, livingArea: area, energyConsumption: consumption }));
  };

  const handleSystemChange = (system: HeatingSystem) => {
    const defaults = systemDefaults[system];
    setInputs(prev => ({
      ...prev,
      oldSystem: system,
      oldEnergyPrice: defaults.energyPrice,
      priceIncrease: defaults.priceIncrease,
      wpElectricityPrice: system === 'nachtspeicher' ? 38.0 : 25.0,
    }));
    setExpert(prev => ({
      ...prev,
      oldEfficiency: defaults.efficiency,
      oldMaintenance: defaults.maintenance,
      oldHilfsenergie: defaults.hilfsenergie,
    }));
  };

  const results = useMemo(() => calculate(inputs, expert), [inputs, expert]);

  const annualSavingsYear1 = results.yearly.length > 0 ? results.yearly[0].savings : 0;

  return (
    <div className="min-h-screen bg-[var(--w-surface)] flex flex-col">
      <Header currentPage="wp-rechner" />

      <main>
        {/* Hero */}
        <div className="bg-[var(--w-blue)] text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-light mb-3">
              Wärmepumpen-Amortisationsrechner
            </h1>
            <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto font-light">
              Vergleiche die Kosten einer Luft-Wasser-Wärmepumpe mit deinem bisherigen Heizsystem.
              Finde heraus, ab wann sich der Umstieg lohnt – mit aktuellen Marktdaten 2025.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Input Form */}
            <div className="lg:col-span-2">
              <div className="border border-[var(--w-border)] bg-white p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <h2 className="text-xl font-medium text-[#222222] mb-6">
                  Deine Angaben
                </h2>

                <div className="space-y-5">
                  {/* Wohnfläche */}
                  <div>
                    <label className="block text-sm font-medium text-[#222222] mb-1.5">
                      Wohnfläche: {inputs.livingArea} m²
                    </label>
                    <input
                      type="range"
                      min="60"
                      max="300"
                      step="5"
                      value={inputs.livingArea}
                      onChange={e => handleAreaChange(parseInt(e.target.value))}
                      className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                      style={{ background: 'var(--w-border)' }}
                    />
                    <div className="flex justify-between text-xs text-[#888888] mt-1">
                      <span>60 m²</span>
                      <span>300 m²</span>
                    </div>
                  </div>

                  {/* Gebäudetyp */}
                  <div>
                    <label className="block text-sm font-medium text-[#222222] mb-1.5">
                      Gebäudetyp
                    </label>
                    <select
                      value={inputs.buildingType}
                      onChange={e => handleBuildingChange(e.target.value as BuildingType)}
                      className="w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm"
                    >
                      {Object.entries(buildingLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bisheriges Heizsystem */}
                  <div>
                    <label className="block text-sm font-medium text-[#222222] mb-1.5">
                      Bisheriges Heizsystem
                    </label>
                    <select
                      value={inputs.oldSystem}
                      onChange={e => handleSystemChange(e.target.value as HeatingSystem)}
                      className="w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm"
                    >
                      {Object.entries(systemLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Energieverbrauch */}
                  <div>
                    <label className="block text-sm font-medium text-[#222222] mb-1.5">
                      Jährlicher Heizenergiebedarf
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.energyConsumption}
                        onChange={e => setInputs(prev => ({ ...prev, energyConsumption: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">kWh</span>
                    </div>
                    <p className="text-xs text-[#888888] mt-1">
                      Automatisch aus Fläche x Gebäudetyp ({buildingKwhM2[inputs.buildingType]} kWh/m²)
                    </p>
                  </div>

                  <div className="border-t border-[var(--w-border)] pt-5">
                    {/* WP-Investition */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Wärmepumpen-Investition: {inputs.wpInvestment.toLocaleString('de-DE')} €
                      </label>
                      <input
                        type="range"
                        min="20000"
                        max="50000"
                        step="500"
                        value={inputs.wpInvestment}
                        onChange={e => setInputs(prev => ({ ...prev, wpInvestment: parseInt(e.target.value) }))}
                        className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                        style={{ background: 'var(--w-border)' }}
                      />
                      <div className="flex justify-between text-xs text-[#888888] mt-1">
                        <span>20.000 €</span>
                        <span>50.000 €</span>
                      </div>
                    </div>

                    {/* WP-Stromtarif */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Stromtarif Wärmepumpe: {inputs.wpElectricityPrice.toFixed(1)} ct/kWh
                      </label>
                      <input
                        type="range"
                        min="18"
                        max="40"
                        step="0.5"
                        value={inputs.wpElectricityPrice}
                        onChange={e => setInputs(prev => ({ ...prev, wpElectricityPrice: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                        style={{ background: 'var(--w-border)' }}
                      />
                      {inputs.oldSystem !== 'nachtspeicher' && (
                        <p className="text-xs text-[#888888] mt-1">
                          WP-Stromtarif mit separatem Zähler: ~21-27 ct/kWh (34% unter Haushaltsstrom)
                        </p>
                      )}
                    </div>

                    {/* Aktueller Energiepreis */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Aktueller {inputs.oldSystem === 'gas' ? 'Gaspreis' : inputs.oldSystem === 'oil' ? 'Ölpreis' : inputs.oldSystem === 'nachtspeicher' ? 'Strompreis' : 'Fernwärmepreis'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={inputs.oldEnergyPrice}
                          onChange={e => setInputs(prev => ({ ...prev, oldEnergyPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">ct/kWh</span>
                      </div>
                      {inputs.oldSystem === 'oil' && (
                        <p className="text-xs text-[#888888] mt-1">
                          1 Liter Heizöl ≈ 10 kWh → 10 ct/kWh ≙ 1,00 €/Liter
                        </p>
                      )}
                    </div>

                    {/* Jährl. Preissteigerung */}
                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Jährl. Preissteigerung {inputs.oldSystem === 'gas' ? 'Gas' : inputs.oldSystem === 'oil' ? 'Öl' : inputs.oldSystem === 'nachtspeicher' ? 'Strom' : 'Fernwärme'}: {inputs.priceIncrease.toFixed(1)} %
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        step="0.5"
                        value={inputs.priceIncrease}
                        onChange={e => setInputs(prev => ({ ...prev, priceIncrease: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                        style={{ background: 'var(--w-border)' }}
                      />
                      <div className="flex justify-between text-xs text-[#888888] mt-1">
                        <span>0 %</span>
                        <span>8 %</span>
                      </div>
                    </div>
                  </div>

                  {/* Expert Settings Toggle */}
                  <div className="border-t border-[var(--w-border)] pt-5">
                    <button
                      onClick={() => setShowExpert(!showExpert)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-[var(--w-border)] bg-[var(--w-surface)] hover:bg-[#F0EDE8] transition-colors text-sm font-medium text-[#222222]"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Experteneinstellungen
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${showExpert ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showExpert && (
                      <div className="mt-4 space-y-4 border border-[var(--w-border)] p-4">
                        {/* JAZ */}
                        <div>
                          <label className="block text-sm font-medium text-[#222222] mb-1.5">
                            Jahresarbeitszahl (JAZ): {expert.jaz.toFixed(1)}
                          </label>
                          <input
                            type="range" min="2.5" max="4.5" step="0.1"
                            value={expert.jaz}
                            onChange={e => setExpert(prev => ({ ...prev, jaz: parseFloat(e.target.value) }))}
                            className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                            style={{ background: 'var(--w-border)' }}
                          />
                          <p className="text-xs text-[#888888] mt-1">
                            Altbau ~2,7 | Saniert ~3,2-3,5 | Neubau ~4,0 (Fraunhofer ISE)
                          </p>
                        </div>

                        {/* Nutzungsgrad Altsystem */}
                        <div>
                          <label className="block text-sm font-medium text-[#222222] mb-1.5">
                            Nutzungsgrad Altsystem: {(expert.oldEfficiency * 100).toFixed(0)} %
                          </label>
                          <input
                            type="range" min="0.70" max="0.98" step="0.01"
                            value={expert.oldEfficiency}
                            onChange={e => setExpert(prev => ({ ...prev, oldEfficiency: parseFloat(e.target.value) }))}
                            className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                            style={{ background: 'var(--w-border)' }}
                          />
                        </div>

                        {/* Wartung WP */}
                        <div>
                          <label className="block text-sm font-medium text-[#222222] mb-1.5">
                            Wartung Wärmepumpe
                          </label>
                          <div className="relative">
                            <input
                              type="number" value={expert.wpMaintenance}
                              onChange={e => setExpert(prev => ({ ...prev, wpMaintenance: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm pr-16"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">€/Jahr</span>
                          </div>
                        </div>

                        {/* Wartung Alt */}
                        <div>
                          <label className="block text-sm font-medium text-[#222222] mb-1.5">
                            Wartung Altsystem (inkl. Schornsteinfeger)
                          </label>
                          <div className="relative">
                            <input
                              type="number" value={expert.oldMaintenance}
                              onChange={e => setExpert(prev => ({ ...prev, oldMaintenance: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm pr-16"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">€/Jahr</span>
                          </div>
                        </div>

                        {/* Strompreissteigerung */}
                        <div>
                          <label className="block text-sm font-medium text-[#222222] mb-1.5">
                            Strompreissteigerung (WP): {expert.stromPreisSteigerung.toFixed(1)} %
                          </label>
                          <input
                            type="range" min="0" max="6" step="0.5"
                            value={expert.stromPreisSteigerung}
                            onChange={e => setExpert(prev => ({ ...prev, stromPreisSteigerung: parseFloat(e.target.value) }))}
                            className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                            style={{ background: 'var(--w-border)' }}
                          />
                        </div>

                        {/* Zusatzkosten */}
                        <div>
                          <label className="block text-sm font-medium text-[#222222] mb-1.5">
                            Zusatzkosten (Heizkörpertausch, FBH etc.)
                          </label>
                          <div className="relative">
                            <input
                              type="number" value={expert.additionalCosts}
                              onChange={e => setExpert(prev => ({ ...prev, additionalCosts: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#888888]">€</span>
                          </div>
                          <p className="text-xs text-[#888888] mt-1">
                            NT-Heizkörper ~3.500 € | FBH nachrüsten ~7.500-11.000 €
                          </p>
                        </div>

                        {/* Betrachtungszeitraum */}
                        <div>
                          <label className="block text-sm font-medium text-[#222222] mb-1.5">
                            Betrachtungszeitraum: {expert.observationPeriod} Jahre
                          </label>
                          <input
                            type="range" min="10" max="25" step="1"
                            value={expert.observationPeriod}
                            onChange={e => setExpert(prev => ({ ...prev, observationPeriod: parseInt(e.target.value) }))}
                            className="w-full h-1.5 appearance-none cursor-pointer accent-[var(--w-blue)]"
                            style={{ background: 'var(--w-border)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[var(--w-border)] bg-white p-5 text-center">
                  <div className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">Amortisation</div>
                  <div className="text-3xl md:text-4xl font-light text-[var(--w-blue)]">
                    {results.breakEvenYear <= expert.observationPeriod
                      ? `${results.breakEvenYear} Jahre`
                      : `>${expert.observationPeriod} J.`}
                  </div>
                  <div className="text-xs text-[#888888] mt-1">bis die Mehrkosten sich rechnen</div>
                </div>

                <div className="border border-[var(--w-border)] bg-white p-5 text-center">
                  <div className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">Ersparnis Jahr 1</div>
                  <div className={`text-3xl md:text-4xl font-light ${annualSavingsYear1 >= 0 ? 'text-[#22a06b]' : 'text-red-500'}`}>
                    {annualSavingsYear1.toLocaleString('de-DE')} €
                  </div>
                  <div className="text-xs text-[#888888] mt-1">Betriebskosten pro Jahr</div>
                </div>

                <div className="border border-[var(--w-border)] bg-white p-5 text-center">
                  <div className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">Nettogewinn</div>
                  <div className={`text-3xl md:text-4xl font-light ${results.totalSavings >= 0 ? 'text-[#22a06b]' : 'text-red-500'}`}>
                    {results.totalSavings.toLocaleString('de-DE')} €
                  </div>
                  <div className="text-xs text-[#888888] mt-1">nach {expert.observationPeriod} Jahren</div>
                </div>

                <div className="border border-[var(--w-border)] bg-white p-5 text-center">
                  <div className="text-xs font-medium text-[#888888] uppercase tracking-wide mb-2">CO₂ eingespart</div>
                  <div className="text-3xl md:text-4xl font-light text-[var(--w-blue)]">
                    {results.co2Saved.toLocaleString('de-DE')} t
                  </div>
                  <div className="text-xs text-[#888888] mt-1">über {expert.observationPeriod} Jahre</div>
                </div>
              </div>

              {/* Comparison Summary */}
              <div className="bg-[#222222] text-white p-6">
                <h3 className="text-lg font-light mb-4">Kostenvergleich auf {expert.observationPeriod} Jahre</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm opacity-60 mb-1">{systemLabels[inputs.oldSystem]}</div>
                    <div className="text-2xl font-light">
                      {(results.oldSystemCostTotal + systemInvestment[inputs.oldSystem]).toLocaleString('de-DE')} €
                    </div>
                    <div className="text-xs opacity-40 mt-1">
                      {systemInvestment[inputs.oldSystem].toLocaleString('de-DE')} € Invest + {results.oldSystemCostTotal.toLocaleString('de-DE')} € Betrieb
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-60 mb-1">Wärmepumpe</div>
                    <div className="text-2xl font-light text-[#4ade80]">
                      {(results.wpCostTotal + inputs.wpInvestment + expert.additionalCosts).toLocaleString('de-DE')} €
                    </div>
                    <div className="text-xs opacity-40 mt-1">
                      {(inputs.wpInvestment + expert.additionalCosts).toLocaleString('de-DE')} € Invest + {results.wpCostTotal.toLocaleString('de-DE')} € Betrieb
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Mehrinvestition WP</span>
                    <span className="font-medium">{results.investmentDifference.toLocaleString('de-DE')} €</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <AmortisationChart data={results.yearly} investmentDiff={results.investmentDifference} />

              {/* Yearly Table */}
              <div className="border border-[var(--w-border)] bg-white p-6">
                <h3 className="text-lg font-medium text-[#222222] mb-4">
                  Jährliche Kostenentwicklung
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-[var(--w-border)]">
                        <th className="text-left py-2 px-2 font-medium text-[#222222]">Jahr</th>
                        <th className="text-right py-2 px-2 font-medium text-[#222222]">{inputs.oldSystem === 'gas' ? 'Gas' : inputs.oldSystem === 'oil' ? 'Öl' : inputs.oldSystem === 'nachtspeicher' ? 'Nachts.' : 'Fernw.'}</th>
                        <th className="text-right py-2 px-2 font-medium text-[#222222]">Wärmepumpe</th>
                        <th className="text-right py-2 px-2 font-medium text-[#222222]">Ersparnis/Jahr</th>
                        <th className="text-right py-2 px-2 font-medium text-[#222222]">Kum. Gewinn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.yearly.map((row, i) => (
                        <tr
                          key={row.year}
                          className={`border-b border-[var(--w-border)] ${i % 2 === 0 ? 'bg-[var(--w-surface)]' : ''}`}
                        >
                          <td className="py-2 px-2 font-medium text-[#222222]">{row.year}</td>
                          <td className="text-right py-2 px-2 text-[#444444]">{row.oldCosts.toLocaleString('de-DE')} €</td>
                          <td className="text-right py-2 px-2 text-[#444444]">{row.wpCosts.toLocaleString('de-DE')} €</td>
                          <td className={`text-right py-2 px-2 font-medium ${row.savings >= 0 ? 'text-[#22a06b]' : 'text-red-500'}`}>
                            {row.savings.toLocaleString('de-DE')} €
                          </td>
                          <td className={`text-right py-2 px-2 font-medium ${row.netProfit >= 0 ? 'text-[#22a06b]' : 'text-red-500'}`}>
                            {row.netProfit.toLocaleString('de-DE')} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Box: CO2 & Regulation */}
              <div className="border border-[var(--w-border)] bg-white p-6">
                <h3 className="text-lg font-medium text-[#222222] mb-4">
                  Regulatorischer Ausblick
                </h3>
                <div className="space-y-3 text-sm text-[#444444]">
                  <div className="flex gap-3 items-start">
                    <span className="text-[var(--w-blue)] font-medium mt-0.5 flex-shrink-0">2025</span>
                    <span>CO₂-Preis: 55 €/t → Aufschlag Gas: 1,32 ct/kWh, Öl: 1,74 ct/kWh</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-[var(--w-blue)] font-medium mt-0.5 flex-shrink-0">2026+</span>
                    <span>CO₂-Preiskorridor: 55-65 €/t, danach marktbasiert (EU-ETS 2)</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-[var(--w-blue)] font-medium mt-0.5 flex-shrink-0">2029</span>
                    <span>Biogas-/Bio-Öl-Beimischungspflichten treten in Kraft</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-red-500 font-medium mt-0.5 flex-shrink-0">2045</span>
                    <span>Betriebsverbot für fossile Heizungen (GEG) – begrenzt die Nutzungsdauer einer heute eingebauten Gas-/Ölheizung</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[var(--w-surface)] border border-[var(--w-border)]">
                  <p className="text-xs text-[#888888]">
                    Prognosen für den CO₂-Preis 2030 reichen von 48 €/t (konservativ) bis 120-200 €/t (Ariadne-Projekt/EWI). Dies ist in den Standardpreissteigerungen bereits berücksichtigt.
                  </p>
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
              Dieser Rechner liefert unverbindliche Schätzwerte auf Basis deiner Eingaben und ist keine Anlage-, Finanz-, Steuer- oder Rechtsberatung. Tatsächliche Kosten können u. a. durch regionale Preisunterschiede, Gebäudezustand, Installationsbedingungen und individuelle Nutzungsmuster abweichen. Energiepreise und CO₂-Steuer-Prognosen basieren auf BDEW, Fraunhofer ISE und BEHG-Daten (Stand 2025).
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
