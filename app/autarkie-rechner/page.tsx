'use client';

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ============================================================
// Empirical model based on HTW Berlin research
// Approximation of self-consumption and autarky rates
// ============================================================

interface Inputs {
  householdConsumption: number;
  pvSize: number;
  batterySize: number;
  hasHeatPump: boolean;
  heatingDemand: number;
  jaz: number;
  hasECar: boolean;
  eCarKm: number;
  hasEMS: boolean;
  electricityPrice: number;
  feedInTariff: number;
}

interface Results {
  totalConsumption: number;
  householdConsumption: number;
  heatPumpConsumption: number;
  eCarConsumption: number;
  pvProduction: number;
  selfConsumedPV: number;
  gridFeedIn: number;
  gridPurchase: number;
  autarkyRate: number;
  selfConsumptionRate: number;
  costWithoutPV: number;
  costWithPV: number;
  annualSavings: number;
  feedInRevenue: number;
  co2Saved: number;
  batteryDirectUse: number;
  batteryContribution: number;
}

// Monthly PV production profile for Germany (normalized to annual total)
const monthlyPVProfile = [0.03, 0.05, 0.08, 0.10, 0.12, 0.13, 0.13, 0.11, 0.09, 0.07, 0.05, 0.04];
// Monthly consumption profile (higher in winter)
const monthlyConsProfile = [0.11, 0.10, 0.09, 0.08, 0.07, 0.06, 0.06, 0.07, 0.08, 0.09, 0.10, 0.10];
// Monthly heat pump profile (most in winter)
const monthlyHeatProfile = [0.18, 0.15, 0.12, 0.08, 0.03, 0.01, 0.01, 0.02, 0.04, 0.09, 0.13, 0.16];

function calculate(inputs: Inputs): Results {
  // Total consumption calculation
  const hpConsumption = inputs.hasHeatPump ? inputs.heatingDemand / inputs.jaz : 0;
  const eCarConsumption = inputs.hasECar ? (inputs.eCarKm / 100) * 18 : 0; // 18 kWh/100km
  const totalConsumption = inputs.householdConsumption + hpConsumption + eCarConsumption;

  // PV production: ~950 kWh/kWp/year average Germany
  const pvProduction = inputs.pvSize * 950;

  // PV-to-consumption ratio (key parameter for empirical model)
  const pvRatio = totalConsumption > 0 ? pvProduction / totalConsumption : 0;

  // Base self-consumption rate without battery (empirical: HTW Berlin)
  // Approximation: SC = 1 - exp(-1/pvRatio) for pvRatio > 0
  // Simplified sigmoid model calibrated to HTW data
  let baseSelfConsumption: number;
  if (pvRatio <= 0) {
    baseSelfConsumption = 1.0;
  } else if (pvRatio <= 0.5) {
    baseSelfConsumption = 1.0 - pvRatio * 0.3;
  } else if (pvRatio <= 1.0) {
    baseSelfConsumption = 0.85 - (pvRatio - 0.5) * 0.4;
  } else if (pvRatio <= 2.0) {
    baseSelfConsumption = 0.65 - (pvRatio - 1.0) * 0.25;
  } else {
    baseSelfConsumption = Math.max(0.15, 0.40 - (pvRatio - 2.0) * 0.08);
  }

  // Battery boost to self-consumption
  // Each kWh of battery adds ~5-8% self-consumption (diminishing returns)
  // Model: batteryBoost = batteryCapacity * factor / totalConsumption (capped)
  let batteryBoostSC = 0;
  if (inputs.batterySize > 0 && totalConsumption > 0) {
    const usableBattery = inputs.batterySize * 0.9; // 90% usable capacity
    const cyclesPerYear = 250; // typical cycles
    const batteryThroughput = usableBattery * cyclesPerYear;
    const maxShiftable = pvProduction * (1 - baseSelfConsumption); // surplus PV
    const actualShift = Math.min(batteryThroughput, maxShiftable, totalConsumption * 0.5);
    batteryBoostSC = pvProduction > 0 ? actualShift / pvProduction : 0;
  }

  // EMS boost: +5% self-consumption through intelligent load shifting
  const emsBoost = inputs.hasEMS ? 0.05 : 0;

  // Heat pump increases self-consumption naturally (flexible load)
  const hpBoost = inputs.hasHeatPump ? 0.03 : 0;

  // Final self-consumption rate
  const selfConsumptionRate = Math.min(0.95, baseSelfConsumption + batteryBoostSC + emsBoost + hpBoost);

  // Energy flows
  const selfConsumedPV = pvProduction * selfConsumptionRate;
  const gridFeedIn = pvProduction - selfConsumedPV;
  const gridPurchase = Math.max(0, totalConsumption - selfConsumedPV);

  // Autarky rate
  const autarkyRate = totalConsumption > 0 ? (selfConsumedPV / totalConsumption) * 100 : 0;
  const selfConsumptionRatePercent = pvProduction > 0 ? (selfConsumedPV / pvProduction) * 100 : 0;

  // Battery contribution to self-consumption
  const batteryContribution = pvProduction > 0 ? batteryBoostSC * pvProduction : 0;
  const batteryDirectUse = selfConsumedPV - batteryContribution;

  // Financial calculation
  const costWithoutPV = totalConsumption * (inputs.electricityPrice / 100);
  const gridCost = gridPurchase * (inputs.electricityPrice / 100);
  const feedInRevenue = gridFeedIn * (inputs.feedInTariff / 100);
  const costWithPV = gridCost - feedInRevenue;
  const annualSavings = costWithoutPV - costWithPV;

  // CO2 savings (German electricity mix: ~0.38 kg/kWh)
  const co2Saved = Math.round(selfConsumedPV * 0.38);

  return {
    totalConsumption: Math.round(totalConsumption),
    householdConsumption: inputs.householdConsumption,
    heatPumpConsumption: Math.round(hpConsumption),
    eCarConsumption: Math.round(eCarConsumption),
    pvProduction: Math.round(pvProduction),
    selfConsumedPV: Math.round(selfConsumedPV),
    gridFeedIn: Math.round(gridFeedIn),
    gridPurchase: Math.round(gridPurchase),
    autarkyRate: Math.round(autarkyRate * 10) / 10,
    selfConsumptionRate: Math.round(selfConsumptionRatePercent * 10) / 10,
    costWithoutPV: Math.round(costWithoutPV),
    costWithPV: Math.round(costWithPV),
    annualSavings: Math.round(annualSavings),
    feedInRevenue: Math.round(feedInRevenue),
    co2Saved,
    batteryDirectUse: Math.round(Math.max(0, batteryDirectUse)),
    batteryContribution: Math.round(batteryContribution),
  };
}

// ============================================================
// Donut Chart Component
// ============================================================

function DonutChart({ value, label, sublabel, color }: {
  value: number;
  label: string;
  sublabel: string;
  color: string;
}) {
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const dashOffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 md:w-48 md:h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          {/* Background ring */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="var(--w-tech-grey)"
            strokeWidth={strokeWidth}
          />
          {/* Value ring */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl md:text-4xl font-light text-[var(--w-black)]" style={{ fontWeight: 300 }}>
            {clampedValue.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="text-center mt-3">
        <div className="text-sm font-medium text-[var(--w-black)]">{label}</div>
        <div className="text-xs text-[var(--w-beige-dark)]">{sublabel}</div>
      </div>
    </div>
  );
}

// ============================================================
// Energy Flow Bar Component
// ============================================================

function EnergyFlowBar({ items, total, unit }: {
  items: { label: string; value: number; color: string }[];
  total: number;
  unit: string;
}) {
  return (
    <div>
      <div className="flex overflow-hidden h-8 mb-3">
        {items.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          if (pct < 0.5) return null;
          return (
            <div
              key={i}
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              className="flex items-center justify-center text-white text-xs font-medium transition-all duration-500 min-w-[2rem]"
              title={`${item.label}: ${item.value.toLocaleString('de-DE')} ${unit}`}
            >
              {pct > 8 ? `${Math.round(pct)}%` : ''}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
            <span className="text-[var(--w-beige-dark)]">{item.label}: <strong className="text-[var(--w-black)] font-medium">{item.value.toLocaleString('de-DE')} {unit}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Monthly Chart
// ============================================================

function MonthlyChart({ pvProduction, totalConsumption, hasHeatPump, hpConsumption }: {
  pvProduction: number;
  totalConsumption: number;
  hasHeatPump: boolean;
  hpConsumption: number;
}) {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  const monthlyPV = monthlyPVProfile.map(f => Math.round(pvProduction * f));
  const monthlyHousehold = monthlyConsProfile.map(f => Math.round((totalConsumption - hpConsumption) * f));
  const monthlyHP = hasHeatPump ? monthlyHeatProfile.map(f => Math.round(hpConsumption * f)) : months.map(() => 0);
  const monthlyTotal = months.map((_, i) => monthlyHousehold[i] + monthlyHP[i]);

  const maxVal = Math.max(...monthlyPV, ...monthlyTotal);

  return (
    <div className="border border-[var(--w-border)] p-6 bg-white">
      <h3 className="text-base font-medium text-[var(--w-black)] mb-4" style={{ fontWeight: 500 }}>
        Monatliche Erzeugung & Verbrauch
      </h3>
      <div className="flex items-end gap-1 md:gap-2 h-48">
        {months.map((month, i) => {
          const pvH = maxVal > 0 ? (monthlyPV[i] / maxVal) * 100 : 0;
          const consH = maxVal > 0 ? (monthlyTotal[i] / maxVal) * 100 : 0;
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end h-40">
                {/* PV bar */}
                <div
                  className="flex-1 transition-all duration-500"
                  style={{ height: `${pvH}%`, backgroundColor: 'var(--w-blue)' }}
                  title={`PV: ${monthlyPV[i].toLocaleString('de-DE')} kWh`}
                />
                {/* Consumption bar */}
                <div
                  className="flex-1 transition-all duration-500"
                  style={{ height: `${consH}%`, backgroundColor: 'var(--w-beige-dark)' }}
                  title={`Verbrauch: ${monthlyTotal[i].toLocaleString('de-DE')} kWh`}
                />
              </div>
              <span className="text-[10px] text-[var(--w-beige-dark)]">{month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-6 mt-4 text-xs text-[var(--w-beige-dark)]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 inline-block" style={{ backgroundColor: 'var(--w-blue)' }}></span>
          PV-Erzeugung
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 inline-block" style={{ backgroundColor: 'var(--w-beige-dark)' }}></span>
          Gesamtverbrauch
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function AutarkieRechner() {
  const [inputs, setInputs] = useState<Inputs>({
    householdConsumption: 4500,
    pvSize: 10,
    batterySize: 10,
    hasHeatPump: false,
    heatingDemand: 18000,
    jaz: 3.2,
    hasECar: false,
    eCarKm: 15000,
    hasEMS: false,
    electricityPrice: 34,
    feedInTariff: 8.1,
  });

  const results = useMemo(() => calculate(inputs), [inputs]);

  const handleChange = (field: keyof Inputs, value: number | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--w-surface)] flex flex-col">
      <Header currentPage="autarkie" />

      {/* Title */}
      <div className="bg-[var(--w-blue)] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl mb-3" style={{ fontWeight: 300 }}>
            PV-Unabhängigkeitsrechner
          </h1>
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto" style={{ fontWeight: 400 }}>
            Berechne deinen Autarkiegrad und Eigenverbrauchsanteil – mit Batterie, Wärmepumpe und E-Auto.
            Finde die optimale Anlagengröße für maximale Unabhängigkeit.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="border border-[var(--w-border)] p-6 bg-white sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <h2 className="text-xl text-[var(--w-black)] mb-6" style={{ fontWeight: 500 }}>
                Deine Angaben
              </h2>

              <div className="space-y-5">
                {/* Jahresstromverbrauch */}
                <div>
                  <label className="block text-sm font-medium text-[var(--w-black)] mb-1.5">
                    Jahresstromverbrauch Haushalt
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={inputs.householdConsumption}
                      onChange={e => handleChange('householdConsumption', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none pr-14 bg-white text-[var(--w-black)]"
                      style={{ borderRadius: 0 }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--w-beige-dark)]">kWh</span>
                  </div>
                  <p className="text-xs text-[var(--w-beige-dark)] mt-1">
                    1 Person ~1.500 | 2 Pers. ~2.500 | 4 Pers. ~4.500 kWh
                  </p>
                </div>

                {/* PV-Leistung */}
                <div>
                  <label className="block text-sm font-medium text-[var(--w-black)] mb-1.5">
                    Photovoltaikleistung: {inputs.pvSize.toFixed(1)} kWp
                  </label>
                  <input
                    type="range" min="3" max="25" step="0.5"
                    value={inputs.pvSize}
                    onChange={e => handleChange('pvSize', parseFloat(e.target.value))}
                    className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                    style={{ background: 'var(--w-tech-grey)' }}
                  />
                  <div className="flex justify-between text-xs text-[var(--w-beige-dark)] mt-1">
                    <span>3 kWp</span>
                    <span>≈ {Math.round(inputs.pvSize * 950).toLocaleString('de-DE')} kWh/Jahr</span>
                    <span>25 kWp</span>
                  </div>
                </div>

                {/* Speicher */}
                <div>
                  <label className="block text-sm font-medium text-[var(--w-black)] mb-1.5">
                    Batteriespeicher: {inputs.batterySize.toFixed(1)} kWh {inputs.batterySize === 0 && '(ohne)'}
                  </label>
                  <input
                    type="range" min="0" max="20" step="0.5"
                    value={inputs.batterySize}
                    onChange={e => handleChange('batterySize', parseFloat(e.target.value))}
                    className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                    style={{ background: 'var(--w-tech-grey)' }}
                  />
                  <div className="flex justify-between text-xs text-[var(--w-beige-dark)] mt-1">
                    <span>Ohne</span>
                    <span>20 kWh</span>
                  </div>
                </div>

                {/* Divider - Optionale Verbraucher */}
                <div className="border-t border-[var(--w-border)] pt-5">
                  <h3 className="text-xs font-medium text-[var(--w-beige-dark)] uppercase tracking-wider mb-4">
                    Optionale Verbraucher
                  </h3>

                  {/* Wärmepumpe */}
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.hasHeatPump}
                        onChange={e => handleChange('hasHeatPump', e.target.checked)}
                        className="w-4 h-4 accent-[var(--w-blue)]"
                      />
                      <span className="ml-3 text-sm font-medium text-[var(--w-black)]">
                        Wärmepumpe
                      </span>
                    </label>
                    {inputs.hasHeatPump && (
                      <div className="mt-3 ml-7 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-[var(--w-beige-dark)] mb-1">
                            Heizwärmebedarf: {inputs.heatingDemand.toLocaleString('de-DE')} kWh
                          </label>
                          <input
                            type="range" min="5000" max="30000" step="500"
                            value={inputs.heatingDemand}
                            onChange={e => handleChange('heatingDemand', parseInt(e.target.value))}
                            className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                            style={{ background: 'var(--w-tech-grey)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--w-beige-dark)] mb-1">
                            JAZ: {inputs.jaz.toFixed(1)}
                          </label>
                          <input
                            type="range" min="2.5" max="4.5" step="0.1"
                            value={inputs.jaz}
                            onChange={e => handleChange('jaz', parseFloat(e.target.value))}
                            className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                            style={{ background: 'var(--w-tech-grey)' }}
                          />
                        </div>
                        <p className="text-xs text-[var(--w-beige-dark)]">
                          Stromverbrauch WP: ~{Math.round(inputs.heatingDemand / inputs.jaz).toLocaleString('de-DE')} kWh/Jahr
                        </p>
                      </div>
                    )}
                  </div>

                  {/* E-Auto */}
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.hasECar}
                        onChange={e => handleChange('hasECar', e.target.checked)}
                        className="w-4 h-4 accent-[var(--w-blue)]"
                      />
                      <span className="ml-3 text-sm font-medium text-[var(--w-black)]">
                        E-Auto
                      </span>
                    </label>
                    {inputs.hasECar && (
                      <div className="mt-3 ml-7">
                        <label className="block text-xs font-medium text-[var(--w-beige-dark)] mb-1">
                          Jährliche Fahrleistung: {inputs.eCarKm.toLocaleString('de-DE')} km
                        </label>
                        <input
                          type="range" min="5000" max="40000" step="1000"
                          value={inputs.eCarKm}
                          onChange={e => handleChange('eCarKm', parseInt(e.target.value))}
                          className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                          style={{ background: 'var(--w-tech-grey)' }}
                        />
                        <p className="text-xs text-[var(--w-beige-dark)] mt-1">
                          ≈ {Math.round((inputs.eCarKm / 100) * 18).toLocaleString('de-DE')} kWh/Jahr (18 kWh/100km)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* EMS */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.hasEMS}
                        onChange={e => handleChange('hasEMS', e.target.checked)}
                        className="w-4 h-4 accent-[var(--w-blue)]"
                      />
                      <span className="ml-3 text-sm font-medium text-[var(--w-black)]">
                        Energiemanagementsystem (EMS)
                      </span>
                    </label>
                    <p className="text-xs text-[var(--w-beige-dark)] mt-1 ml-7">
                      +5% Eigenverbrauch durch intelligente Laststeuerung
                    </p>
                  </div>
                </div>

                {/* Finanziell */}
                <div className="border-t border-[var(--w-border)] pt-5">
                  <h3 className="text-xs font-medium text-[var(--w-beige-dark)] uppercase tracking-wider mb-4">
                    Strompreise
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--w-black)] mb-1.5">
                        Strompreis: {inputs.electricityPrice} ct/kWh
                      </label>
                      <input
                        type="range" min="25" max="45" step="0.5"
                        value={inputs.electricityPrice}
                        onChange={e => handleChange('electricityPrice', parseFloat(e.target.value))}
                        className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                        style={{ background: 'var(--w-tech-grey)' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--w-black)] mb-1.5">
                        Einspeisevergütung: {inputs.feedInTariff} ct/kWh
                      </label>
                      <input
                        type="range" min="5" max="12" step="0.1"
                        value={inputs.feedInTariff}
                        onChange={e => handleChange('feedInTariff', parseFloat(e.target.value))}
                        className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                        style={{ background: 'var(--w-tech-grey)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">

            {/* Donut Charts */}
            <div className="border border-[var(--w-border)] p-6 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <DonutChart
                  value={results.autarkyRate}
                  label="Autarkiegrad"
                  sublabel="Anteil Eigenversorgung"
                  color="var(--w-blue)"
                />
                <DonutChart
                  value={results.selfConsumptionRate}
                  label="Eigenverbrauchsanteil"
                  sublabel="PV-Strom selbst genutzt"
                  color="var(--w-sage-dark)"
                />
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border border-[var(--w-border)] p-4 text-center bg-white">
                <div className="text-xs text-[var(--w-beige-dark)] mb-1">PV-Erzeugung</div>
                <div className="text-xl text-[var(--w-blue)]" style={{ fontWeight: 300 }}>
                  {results.pvProduction.toLocaleString('de-DE')}
                </div>
                <div className="text-xs text-[var(--w-beige-dark)]">kWh/Jahr</div>
              </div>
              <div className="border border-[var(--w-border)] p-4 text-center bg-white">
                <div className="text-xs text-[var(--w-beige-dark)] mb-1">Eigenverbrauch</div>
                <div className="text-xl text-[var(--w-sage-dark)]" style={{ fontWeight: 300 }}>
                  {results.selfConsumedPV.toLocaleString('de-DE')}
                </div>
                <div className="text-xs text-[var(--w-beige-dark)]">kWh/Jahr</div>
              </div>
              <div className="border border-[var(--w-border)] p-4 text-center bg-white">
                <div className="text-xs text-[var(--w-beige-dark)] mb-1">Netzeinspeisung</div>
                <div className="text-xl text-[var(--w-beige-dark)]" style={{ fontWeight: 300 }}>
                  {results.gridFeedIn.toLocaleString('de-DE')}
                </div>
                <div className="text-xs text-[var(--w-beige-dark)]">kWh/Jahr</div>
              </div>
              <div className="border border-[var(--w-border)] p-4 text-center bg-white">
                <div className="text-xs text-[var(--w-beige-dark)] mb-1">Netzbezug</div>
                <div className="text-xl text-[var(--w-status-red)]" style={{ fontWeight: 300 }}>
                  {results.gridPurchase.toLocaleString('de-DE')}
                </div>
                <div className="text-xs text-[var(--w-beige-dark)]">kWh/Jahr</div>
              </div>
            </div>

            {/* Energy Flow Visualization */}
            <div className="border border-[var(--w-border)] p-6 bg-white">
              <h3 className="text-base font-medium text-[var(--w-black)] mb-4">
                Stromverbrauch
              </h3>
              <EnergyFlowBar
                items={[
                  { label: 'Haushalt', value: results.householdConsumption, color: '#6366f1' },
                  ...(results.heatPumpConsumption > 0 ? [{ label: 'Wärmepumpe', value: results.heatPumpConsumption, color: '#f97316' }] : []),
                  ...(results.eCarConsumption > 0 ? [{ label: 'E-Auto', value: results.eCarConsumption, color: '#06b6d4' }] : []),
                ]}
                total={results.totalConsumption}
                unit="kWh"
              />

              <h3 className="text-base font-medium text-[var(--w-black)] mb-4 mt-6">
                Stromherkunft
              </h3>
              <EnergyFlowBar
                items={[
                  { label: 'Direktverbrauch PV', value: results.batteryDirectUse, color: 'var(--w-blue)' },
                  ...(results.batteryContribution > 0 ? [{ label: 'Aus Batterie', value: results.batteryContribution, color: 'var(--w-sage-dark)' }] : []),
                  { label: 'Netzbezug', value: results.gridPurchase, color: 'var(--w-status-red)' },
                ]}
                total={results.totalConsumption}
                unit="kWh"
              />
            </div>

            {/* Monthly Chart */}
            <MonthlyChart
              pvProduction={results.pvProduction}
              totalConsumption={results.totalConsumption}
              hasHeatPump={inputs.hasHeatPump}
              hpConsumption={results.heatPumpConsumption}
            />

            {/* Financial Summary */}
            <div className="bg-[var(--w-blue)] text-white p-6">
              <h3 className="text-base font-medium mb-4">Finanzielle Auswirkung pro Jahr</h3>
              <div className="space-y-0">
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-sm opacity-70">Stromkosten ohne PV</span>
                  <span className="font-medium">{results.costWithoutPV.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-sm opacity-70">Reststromkosten (Netz)</span>
                  <span className="font-medium">{Math.round(results.gridPurchase * (inputs.electricityPrice / 100)).toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/20">
                  <span className="text-sm opacity-70">Einspeisevergütung</span>
                  <span className="font-medium text-[var(--w-sage)]">-{results.feedInRevenue.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between items-center py-4 px-4 mt-3 bg-white/10">
                  <span className="font-medium text-white">Jährliche Ersparnis</span>
                  <span className="text-2xl text-[var(--w-sage)]" style={{ fontWeight: 300 }}>{results.annualSavings.toLocaleString('de-DE')} €</span>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-center">
                <div className="flex-1 p-3 bg-white/10">
                  <div className="text-2xl" style={{ fontWeight: 300 }}>{results.co2Saved.toLocaleString('de-DE')}</div>
                  <div className="text-xs opacity-70">kg CO₂ eingespart/Jahr</div>
                </div>
                <div className="flex-1 p-3 bg-white/10">
                  <div className="text-2xl" style={{ fontWeight: 300 }}>{Math.round(results.co2Saved / 1000 * 20 * 10) / 10}</div>
                  <div className="text-xs opacity-70">Tonnen CO₂ in 20 Jahren</div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="border border-[var(--w-border)] p-6 bg-white">
              <h3 className="text-base font-medium text-[var(--w-black)] mb-4">
                Optimierungstipps
              </h3>
              <div className="space-y-3 text-sm">
                {results.autarkyRate < 30 && (
                  <div className="flex gap-3 p-3 bg-[var(--w-blue-superlight)] border-l-2 border-[var(--w-blue)]">
                    <span className="text-[var(--w-blue)] font-medium flex-shrink-0">PV</span>
                    <span className="text-[var(--w-black)]">Deine PV-Anlage ist relativ klein im Verhältnis zum Verbrauch. Eine größere Anlage würde die Autarkie deutlich steigern.</span>
                  </div>
                )}
                {inputs.batterySize === 0 && results.selfConsumptionRate < 50 && (
                  <div className="flex gap-3 p-3 bg-[var(--w-sage-light)] border-l-2 border-[var(--w-sage-dark)]">
                    <span className="text-[var(--w-sage-dark)] font-medium flex-shrink-0">Batterie</span>
                    <span className="text-[var(--w-sage-superdark)]">Ein Batteriespeicher (z.B. 10 kWh) kann deinen Eigenverbrauch um 15-25% steigern – Überschuss vom Tag wird abends genutzt.</span>
                  </div>
                )}
                {!inputs.hasEMS && inputs.batterySize > 0 && (
                  <div className="flex gap-3 p-3 bg-[var(--w-blue-superlight)] border-l-2 border-[var(--w-blue)]">
                    <span className="text-[var(--w-blue)] font-medium flex-shrink-0">EMS</span>
                    <span className="text-[var(--w-black)]">Ein Energiemanagementsystem optimiert automatisch, wann Batterie, Wärmepumpe und Wallbox laden – nochmal ~5% mehr Eigenverbrauch.</span>
                  </div>
                )}
                {results.selfConsumptionRate < 30 && (
                  <div className="flex gap-3 p-3 bg-[var(--w-beige-light)] border-l-2 border-[var(--w-beige-dark)]">
                    <span className="text-[var(--w-beige-superdark)] font-medium flex-shrink-0">Tipp</span>
                    <span className="text-[var(--w-beige-superdark)]">Dein Eigenverbrauchsanteil ist niedrig – viel PV-Strom wird eingespeist. Überlege, ob ein größerer Speicher oder zusätzliche Verbraucher (WP, E-Auto) sinnvoll sind.</span>
                  </div>
                )}
                {results.autarkyRate > 60 && (
                  <div className="flex gap-3 p-3 bg-[var(--w-sage-light)] border-l-2 border-[var(--w-sage-dark)]">
                    <span className="text-[var(--w-sage-dark)] font-medium flex-shrink-0">Top</span>
                    <span className="text-[var(--w-sage-superdark)]">Über 60% Autarkie – du bist auf einem sehr guten Weg zur Energieunabhängigkeit!</span>
                  </div>
                )}
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
            Dieser Rechner liefert Schätzwerte auf Basis empirischer Modelle (HTW Berlin) und ist keine Garantie für tatsächliche Erträge. Autarkie- und Eigenverbrauchswerte hängen von Verbrauchsprofil, Standort, Ausrichtung, Verschattung und Nutzerverhalten ab. Der PV-Ertrag basiert auf dem deutschen Durchschnitt (~950 kWh/kWp/Jahr).
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
