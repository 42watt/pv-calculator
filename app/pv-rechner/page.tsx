'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  CustomerInputs,
  ExpertSettings,
  defaultExpertSettings,
  calculateSystem,
  CalculationResults,
  co2Scenarios,
  calculateHeatingScenario,
  migrateSettings,
} from '@/lib/calculations';

export default function PVRechner() {
  const [showSettings, setShowSettings] = useState(false);
  const [customerInputs, setCustomerInputs] = useState<CustomerInputs>({
    householdConsumption: 4000,
    heatingConsumption: 24000,
    heatingType: 'gas',
    hasECar: false,
    eCarKm: 15000,
    pvSize: 10,
    batterySize: 10,
    hasEMS: true,
    totalInvestment: 35000,
    electricityPrice: 28,
    gasPrice: 11,
    oilPrice: 12,
  });

  const [expertSettings, setExpertSettings] = useState<ExpertSettings>(defaultExpertSettings);
  const [results, setResults] = useState<CalculationResults | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('expertSettings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      const migratedSettings = migrateSettings(parsedSettings);
      setExpertSettings(migratedSettings);

      if (migratedSettings.version !== parsedSettings.version) {
        localStorage.setItem('expertSettings', JSON.stringify(migratedSettings));
      }
    }
  }, []);

  useEffect(() => {
    if (customerInputs.pvSize > 0) {
      const calc = calculateSystem(customerInputs, expertSettings);
      setResults(calc);
    }
  }, [customerInputs, expertSettings]);

  const handleInputChange = (field: keyof CustomerInputs, value: number | boolean | string) => {
    setCustomerInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--w-surface)]">
      <Header currentPage="pv" />

      <main>
        {/* Title */}
        <div className="max-w-7xl mx-auto pt-10 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-light text-[#222222] mb-2">
            PV &amp; Wärmepumpe Rechner
          </h1>
          <p className="text-base text-[var(--w-tech-grey)] mb-8 font-normal">
            Berechnen Sie Ihre Ersparnis und Unabhängigkeit
          </p>
        </div>

        <div className="max-w-7xl mx-auto pb-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[var(--w-border)] p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <h2 className="text-xl font-medium text-[#222222] mb-6">
                  Ihre Eingaben
                </h2>

                {/* Current Consumption */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[var(--w-tech-grey)] uppercase tracking-wide mb-4">
                    Mein aktueller Jahresverbrauch
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Haushaltsstrom (kWh)
                      </label>
                      <input
                        type="number"
                        value={customerInputs.householdConsumption}
                        onChange={(e) =>
                          handleInputChange('householdConsumption', parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none bg-white text-[#222222] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Heizenergie Gas/Öl (kWh)
                      </label>
                      <input
                        type="number"
                        value={customerInputs.heatingConsumption}
                        onChange={(e) =>
                          handleInputChange('heatingConsumption', parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none bg-white text-[#222222] text-sm"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center cursor-pointer gap-3">
                        <input
                          type="checkbox"
                          checked={customerInputs.hasECar}
                          onChange={(e) => handleInputChange('hasECar', e.target.checked)}
                          className="w-4 h-4 accent-[var(--w-blue)]"
                        />
                        <span className="text-sm font-medium text-[#222222]">
                          Ich fahre ein E-Auto
                        </span>
                      </label>
                    </div>

                    {customerInputs.hasECar && (
                      <div>
                        <label className="block text-sm font-medium text-[#222222] mb-1.5">
                          Jährliche Fahrleistung (km)
                        </label>
                        <input
                          type="number"
                          value={customerInputs.eCarKm}
                          onChange={(e) =>
                            handleInputChange('eCarKm', parseFloat(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none bg-white text-[#222222] text-sm"
                        />
                        <p className="text-xs text-[var(--w-tech-grey)] mt-1">
                          ≈ {Math.round((customerInputs.eCarKm / 100) * 20)} kWh Jahresverbrauch
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Planned System */}
                <div className="mb-6 pt-6 border-t border-[var(--w-border)]">
                  <h3 className="text-sm font-semibold text-[var(--w-tech-grey)] uppercase tracking-wide mb-4">
                    Mein geplantes System
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Größe PV-Anlage:{' '}
                        <span className="font-light text-[var(--w-blue)]">{customerInputs.pvSize} kWp</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="0.5"
                        value={customerInputs.pvSize}
                        onChange={(e) => handleInputChange('pvSize', parseFloat(e.target.value))}
                        className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Größe Speicher:{' '}
                        <span className="font-light text-[var(--w-blue)]">
                          {customerInputs.batterySize} kWh{' '}
                          {customerInputs.batterySize === 0 && '(ohne Speicher)'}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        step="0.5"
                        value={customerInputs.batterySize}
                        onChange={(e) =>
                          handleInputChange('batterySize', parseFloat(e.target.value))
                        }
                        className="w-full h-1 appearance-none cursor-pointer accent-[var(--w-blue)]"
                      />
                      <p className="text-xs text-[var(--w-tech-grey)] mt-1">
                        Tipp: Ein Speicher erhöht die Autarkie deutlich
                      </p>
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center cursor-pointer gap-3">
                        <input
                          type="checkbox"
                          checked={customerInputs.hasEMS}
                          onChange={(e) => handleInputChange('hasEMS', e.target.checked)}
                          className="w-4 h-4 accent-[var(--w-blue)]"
                        />
                        <span className="text-sm font-medium text-[#222222]">
                          Energiemanagementsystem (EMS)
                        </span>
                      </label>
                      <p className="text-xs text-[var(--w-tech-grey)] mt-1 ml-7">
                        Optimiert den Eigenverbrauch automatisch
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Investitionskosten (€)
                      </label>
                      <input
                        type="number"
                        value={customerInputs.totalInvestment}
                        onChange={(e) =>
                          handleInputChange('totalInvestment', parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none bg-white text-[#222222] text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Energy Costs */}
                <div className="pt-6 border-t border-[var(--w-border)]">
                  <h3 className="text-sm font-semibold text-[var(--w-tech-grey)] uppercase tracking-wide mb-4">
                    Meine aktuellen Energiekosten
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Strompreis (ct/kWh)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={customerInputs.electricityPrice}
                        onChange={(e) =>
                          handleInputChange('electricityPrice', parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none bg-white text-[#222222] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        Heizungstyp
                      </label>
                      <select
                        value={customerInputs.heatingType}
                        onChange={(e) =>
                          handleInputChange('heatingType', e.target.value as 'gas' | 'oil')
                        }
                        className="w-full px-3 py-2 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none bg-white text-[#222222] text-sm"
                      >
                        <option value="gas">Gas</option>
                        <option value="oil">Öl</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#222222] mb-1.5">
                        {customerInputs.heatingType === 'gas' ? 'Gaspreis' : 'Ölpreis'} (ct/kWh)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={customerInputs.heatingType === 'gas' ? customerInputs.gasPrice : customerInputs.oilPrice}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          handleInputChange(
                            customerInputs.heatingType === 'gas' ? 'gasPrice' : 'oilPrice',
                            value
                          );
                        }}
                        className="w-full px-3 py-2 border border-[var(--w-border)] focus:border-[var(--w-blue)] focus:outline-none bg-white text-[#222222] text-sm"
                      />
                      {customerInputs.heatingType === 'oil' && (
                        <div className="mt-2 p-3 border border-[var(--w-border)] bg-[var(--w-surface)]">
                          <p className="text-xs text-[var(--w-tech-grey)]">
                            <strong className="text-[#222222]">Info:</strong> 1 Liter Heizöl = ~10 kWh thermische Energie<br />
                            Aktueller Marktpreis: ~1,00 €/Liter = ~10 ct/kWh<br />
                            <span className="opacity-70 text-[10px]">(Stand 2024/2025, bei 3.000 Liter Abnahme)</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Settings Toggle */}
                <div className="pt-6 border-t border-[var(--w-border)]">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-[var(--w-border)] hover:border-[var(--w-blue)] transition-colors text-sm font-medium text-[#222222] bg-white"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--w-tech-grey)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Experteneinstellungen
                    </span>
                    <svg
                      className={`w-4 h-4 text-[var(--w-tech-grey)] transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSettings && (
                    <div className="mt-2 p-3 border border-[var(--w-border)] border-t-0 bg-[var(--w-surface)]">
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-sm text-[var(--w-blue)] font-medium hover:underline"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        Alle Einstellungen öffnen
                      </Link>
                    </div>
                  )}
                </div>

                {/* Additional Options */}
                <div className="pt-6 border-t border-[var(--w-border)] mt-6">
                  <h3 className="text-sm font-semibold text-[var(--w-tech-grey)] uppercase tracking-wide mb-4">
                    Zusätzliche Kosten
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertSettings.includeMaintenanceCosts}
                        onChange={(e) =>
                          setExpertSettings({
                            ...expertSettings,
                            includeMaintenanceCosts: e.target.checked,
                          })
                        }
                        className="mt-0.5 w-4 h-4 accent-[var(--w-blue)]"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#222222]">
                          Wartungskosten einberechnen
                        </span>
                        <p className="text-xs text-[var(--w-tech-grey)] mt-0.5">
                          299 €/Jahr für Wartung und Reinigung
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertSettings.includeInverterReplacement}
                        onChange={(e) =>
                          setExpertSettings({
                            ...expertSettings,
                            includeInverterReplacement: e.target.checked,
                          })
                        }
                        className="mt-0.5 w-4 h-4 accent-[var(--w-blue)]"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#222222]">
                          Wechselrichter-Austausch einberechnen
                        </span>
                        <p className="text-xs text-[var(--w-tech-grey)] mt-0.5">
                          200 €/Jahr Rücklage (3.000 € nach 15 Jahren)
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertSettings.includeBatteryDegradation}
                        onChange={(e) =>
                          setExpertSettings({
                            ...expertSettings,
                            includeBatteryDegradation: e.target.checked,
                          })
                        }
                        className="mt-0.5 w-4 h-4 accent-[var(--w-blue)]"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#222222]">
                          Speicher-Degradation berücksichtigen
                        </span>
                        <p className="text-xs text-[var(--w-tech-grey)] mt-0.5">
                          1.5%/Jahr Kapazitätsverlust (ab Jahr 5)
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertSettings.includeChimneySweep}
                        onChange={(e) =>
                          setExpertSettings({
                            ...expertSettings,
                            includeChimneySweep: e.target.checked,
                          })
                        }
                        className="mt-0.5 w-4 h-4 accent-[var(--w-blue)]"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-[#222222]">
                          Kaminkehrer-Kosten entfallen
                        </span>
                        <p className="text-xs text-[var(--w-tech-grey)] mt-0.5">
                          100 €/Jahr Ersparnis durch Wärmepumpe
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              {results && (
                <div className="space-y-6">
                  {/* Export Button (hidden for now) */}
                  <div className="hidden print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[var(--w-blue)] transition-colors flex items-center gap-2 text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Als PDF exportieren
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[var(--w-blue)] text-white p-6">
                      <div className="text-xs font-medium uppercase tracking-wide opacity-80 mb-2">
                        Jährliche Ersparnis
                      </div>
                      <div className="text-3xl font-light">
                        {results.yearlyTotalSavings.toLocaleString('de-DE')} €
                      </div>
                    </div>

                    <div className="bg-[#222222] text-white p-6">
                      <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-2">
                        Autarkiegrad
                      </div>
                      <div className="text-3xl font-light">{results.autarkyRate}%</div>
                    </div>

                    <div className="bg-[#222222] text-white p-6">
                      <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-2">
                        Amortisation
                      </div>
                      <div className="text-3xl font-light">
                        {results.amortizationYears} Jahre
                      </div>
                    </div>
                  </div>

                  {/* Annual Savings Details */}
                  <div className="bg-white border border-[var(--w-border)] p-6">
                    <h3 className="text-lg font-medium text-[#222222] mb-5">
                      Ihre jährlichen Vorteile
                    </h3>

                    <div className="divide-y divide-[var(--w-border)]">
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-[#222222]">
                          Gesparte Stromkosten (Eigenverbrauch)
                        </span>
                        <span className="font-medium text-[var(--color--green)]">
                          +{results.yearlyElectricitySavings.toLocaleString('de-DE')} €
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-[#222222]">Einspeisevergütung</span>
                        <span className="font-medium text-[var(--color--green)]">
                          +{results.yearlyFeedInRevenue.toLocaleString('de-DE')} €
                        </span>
                      </div>

                      {customerInputs.hasEMS && results.emsBonus > 0 && (
                        <div className="flex justify-between items-center py-3">
                          <span className="text-sm text-[#222222]">EMS-Optimierung</span>
                          <span className="font-medium text-[var(--color--green)]">
                            +{results.emsBonus.toLocaleString('de-DE')} €
                          </span>
                        </div>
                      )}

                      {results.chimneySweepSavings > 0 && (
                        <div className="flex justify-between items-center py-3">
                          <span className="text-sm text-[#222222]">Kaminkehrer entfällt</span>
                          <span className="font-medium text-[var(--color--green)]">
                            +{results.chimneySweepSavings.toLocaleString('de-DE')} €
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-[#222222]">
                          Heizkosten gespart (WP vs.{' '}
                          {customerInputs.heatingType === 'gas' ? 'Gas' : 'Öl'})
                        </span>
                        <span className="font-medium text-[var(--color--green)]">
                          +{results.yearlyHeatingSavings.toLocaleString('de-DE')} €
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-[var(--w-blue)]">
                      <span className="font-medium text-[#222222]">Gesamtersparnis pro Jahr</span>
                      <span className="font-light text-2xl text-[var(--w-blue)]">
                        {results.yearlyTotalSavings.toLocaleString('de-DE')} €
                      </span>
                    </div>
                  </div>

                  {/* CO₂ Scenarios Comparison */}
                  <div className="bg-white border border-[var(--w-border)] p-6">
                    <h3 className="text-lg font-medium text-[#222222] mb-2">
                      CO₂-Steuer Szenarien:{' '}
                      {customerInputs.heatingType === 'gas' ? 'Gasheizung' : 'Ölheizung'}{' '}
                      Kostensteigerung
                    </h3>

                    <p className="text-sm text-[var(--w-tech-grey)] mb-5">
                      Die Entwicklung der CO₂-Steuer beeinflusst Ihre{' '}
                      {customerInputs.heatingType === 'gas'
                        ? 'Gasheizungskosten'
                        : 'Ölheizungskosten'}{' '}
                      stark. Hier sehen Sie 3 Szenarien basierend auf politischen Prognosen:
                    </p>

                    {(() => {
                      const conservativeScenario = calculateHeatingScenario(customerInputs, expertSettings, co2Scenarios.conservative);
                      const moderateScenario = calculateHeatingScenario(customerInputs, expertSettings, co2Scenarios.moderate);
                      const aggressiveScenario = calculateHeatingScenario(customerInputs, expertSettings, co2Scenarios.aggressive);

                      const years = [2025, 2027, 2030];

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[var(--w-border)]">
                                <th className="text-left py-3 px-2 font-medium text-[var(--w-tech-grey)] text-xs uppercase tracking-wide">
                                  Jahr
                                </th>
                                <th className="text-right py-3 px-2 font-medium text-green-700 text-xs uppercase tracking-wide">
                                  Konservativ
                                </th>
                                <th className="text-right py-3 px-2 font-medium text-orange-600 text-xs uppercase tracking-wide">
                                  Moderat (Standard)
                                </th>
                                <th className="text-right py-3 px-2 font-medium text-red-700 text-xs uppercase tracking-wide">
                                  Aggressiv
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--w-border)]">
                              {years.map((year) => {
                                const conservative = conservativeScenario.find((s) => s.year === year);
                                const moderate = moderateScenario.find((s) => s.year === year);
                                const aggressive = aggressiveScenario.find((s) => s.year === year);

                                return (
                                  <tr key={year}>
                                    <td className="py-3 px-2 font-medium text-[#222222]">{year}</td>
                                    <td className="text-right py-3 px-2 text-green-700">
                                      {conservative?.gasCosts.toLocaleString('de-DE')} €
                                    </td>
                                    <td className="text-right py-3 px-2 font-medium text-orange-600">
                                      {moderate?.gasCosts.toLocaleString('de-DE')} €
                                    </td>
                                    <td className="text-right py-3 px-2 text-red-700">
                                      {aggressive?.gasCosts.toLocaleString('de-DE')} €
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="border-t border-[var(--w-border)] bg-[var(--w-surface)] font-medium">
                                <td className="py-3 px-2 text-[#222222]">Gesamt (2025–2030)</td>
                                <td className="text-right py-3 px-2 text-green-700">
                                  {conservativeScenario
                                    .slice(0, 6)
                                    .reduce((sum, s) => sum + s.gasCosts, 0)
                                    .toLocaleString('de-DE')}{' '}
                                  €
                                </td>
                                <td className="text-right py-3 px-2 text-orange-600">
                                  {moderateScenario
                                    .slice(0, 6)
                                    .reduce((sum, s) => sum + s.gasCosts, 0)
                                    .toLocaleString('de-DE')}{' '}
                                  €
                                </td>
                                <td className="text-right py-3 px-2 text-red-700">
                                  {aggressiveScenario
                                    .slice(0, 6)
                                    .reduce((sum, s) => sum + s.gasCosts, 0)
                                    .toLocaleString('de-DE')}{' '}
                                  €
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}

                    <div className="mt-5 p-4 border border-[var(--w-blue)] bg-[var(--w-surface)]">
                      <p className="text-sm text-[#222222]">
                        <strong>Mit Wärmepumpe:</strong> Sie sparen diese steigenden Gaskosten
                        komplett und zahlen nur noch günstigeren Strom (teilweise aus eigener
                        PV-Anlage). Die Berechnung oben verwendet das{' '}
                        <strong>moderate Szenario</strong> als Standard.
                      </p>
                    </div>
                  </div>

                  {/* System Performance */}
                  <div className="bg-white border border-[var(--w-border)] p-6">
                    <h3 className="text-lg font-medium text-[#222222] mb-5">
                      Ihre neue Autarkiequote
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border border-[var(--w-border)] bg-[var(--w-surface)]">
                        <div className="text-2xl font-light text-[var(--w-blue)]">
                          {results.pvProduction.toLocaleString('de-DE')}
                        </div>
                        <div className="text-xs text-[var(--w-tech-grey)] mt-1 font-medium uppercase tracking-wide">
                          kWh PV-Ertrag
                        </div>
                      </div>

                      <div className="text-center p-4 border border-[var(--w-border)] bg-[var(--w-surface)]">
                        <div className="text-2xl font-light text-[var(--w-blue)]">
                          {results.selfConsumption.toLocaleString('de-DE')}
                        </div>
                        <div className="text-xs text-[var(--w-tech-grey)] mt-1 font-medium uppercase tracking-wide">
                          kWh Eigenverbrauch
                        </div>
                      </div>

                      <div className="text-center p-4 border border-[var(--w-border)] bg-[var(--w-surface)]">
                        <div className="text-2xl font-light text-[var(--w-blue)]">
                          {results.autarkyRate}%
                        </div>
                        <div className="text-xs text-[var(--w-tech-grey)] mt-1 font-medium uppercase tracking-wide">
                          Autarkie
                        </div>
                      </div>

                      <div className="text-center p-4 border border-[var(--w-border)] bg-[var(--w-surface)]">
                        <div className="text-2xl font-light text-[var(--w-blue)]">
                          {results.selfConsumptionRate}%
                        </div>
                        <div className="text-xs text-[var(--w-tech-grey)] mt-1 font-medium uppercase tracking-wide">
                          Eigenverbrauch
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 p-4 border border-[var(--w-border)] bg-[var(--w-surface)]">
                      <p className="text-sm text-[#222222] leading-relaxed">
                        <strong>Ihr Strombedarf:</strong>{' '}
                        {results.totalElectricityDemand.toLocaleString('de-DE')} kWh/Jahr
                        (Haushalt: {customerInputs.householdConsumption.toLocaleString('de-DE')} kWh
                        {customerInputs.hasECar &&
                          `, E-Auto: ${results.eCarConsumption.toLocaleString('de-DE')} kWh`}
                        , Wärmepumpe: {results.heatPumpConsumption.toLocaleString('de-DE')} kWh)
                        <br />
                        <strong>Vom Netz:</strong>{' '}
                        {results.gridElectricity.toLocaleString('de-DE')} kWh
                        <br />
                        <strong>Einspeisung:</strong> {results.feedIn.toLocaleString('de-DE')} kWh
                      </p>
                    </div>
                  </div>

                  {/* Heating Comparison */}
                  <div className="bg-white border border-[var(--w-border)] p-6">
                    <h3 className="text-lg font-medium text-[#222222] mb-5">
                      Vergleich:{' '}
                      {customerInputs.heatingType === 'gas' ? 'Gasheizung' : 'Ölheizung'} vs.
                      Wärmepumpe
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--w-border)]">
                            <th className="text-left py-3 px-4 font-medium text-[var(--w-tech-grey)] text-xs uppercase tracking-wide">
                              Jahr
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-[var(--w-tech-grey)] text-xs uppercase tracking-wide">
                              {customerInputs.heatingType === 'gas' ? 'Gasheizung' : 'Ölheizung'}
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-[var(--w-tech-grey)] text-xs uppercase tracking-wide">
                              Wärmepumpe
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-[var(--w-blue)] text-xs uppercase tracking-wide">
                              Ersparnis
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--w-border)]">
                          {results.heatingComparison.map((row) => (
                            <tr key={row.year}>
                              <td className="py-3 px-4 font-medium text-[#222222]">{row.year}</td>
                              <td className="text-right py-3 px-4 text-[#222222]">
                                {row.gasCosts.toLocaleString('de-DE')} €
                              </td>
                              <td className="text-right py-3 px-4 text-[#222222]">
                                {row.heatPumpCosts.toLocaleString('de-DE')} €
                              </td>
                              <td className="text-right py-3 px-4 font-medium text-[var(--color--green)]">
                                {row.savings.toLocaleString('de-DE')} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 p-4 border border-[var(--w-border)] bg-[var(--w-surface)]">
                      <p className="text-sm text-[#222222] mb-2">
                        Die{' '}
                        {customerInputs.heatingType === 'gas' ? 'Gaskosten' : 'Ölkosten'} steigen
                        durch die CO₂-Steuer jedes Jahr deutlich an, während Ihre Wärmepumpe
                        größtenteils mit selbst erzeugtem Solarstrom läuft.
                      </p>
                      <p className="text-xs text-[var(--w-tech-grey)]">
                        <strong className="text-[#222222]">
                          Aktuelle{' '}
                          {customerInputs.heatingType === 'gas' ? 'Gaskosten' : 'Ölkosten'}:
                        </strong>{' '}
                        {customerInputs.heatingType === 'gas'
                          ? customerInputs.gasPrice
                          : customerInputs.oilPrice}{' '}
                        ct/kWh für {customerInputs.heatingConsumption.toLocaleString('de-DE')} kWh
                        ={' '}
                        {Math.round(
                          ((customerInputs.heatingType === 'gas'
                            ? customerInputs.gasPrice
                            : customerInputs.oilPrice) /
                            100) *
                            customerInputs.heatingConsumption
                        ).toLocaleString('de-DE')}{' '}
                        € jährlich
                        <br />
                        <strong className="text-[#222222]">Jährliche Preissteigerungen:</strong>{' '}
                        Strom: {expertSettings.electricityPriceIncrease}% |{' '}
                        {customerInputs.heatingType === 'gas' ? 'Gas' : 'Öl'}:{' '}
                        {expertSettings.gasPriceIncrease}% (zzgl. CO₂-Steuer)
                        <br />
                        <strong className="text-[#222222]">Autarkie-Steigerung:</strong> Speicher:
                        +{expertSettings.batteryAutarkyBoost}% | EMS: +
                        {expertSettings.emsAutarkyBoost}%
                      </p>
                    </div>
                  </div>

                  {/* Amortization & Profit */}
                  <div className="bg-[#222222] text-white p-6">
                    <h3 className="text-xl font-light mb-6">Wirtschaftlichkeit</h3>

                    <div className="divide-y divide-white/10">
                      <div className="flex justify-between items-center py-4">
                        <span className="text-sm text-white/70">Investitionskosten</span>
                        <span className="font-light text-xl">
                          {customerInputs.totalInvestment.toLocaleString('de-DE')} €
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-4">
                        <span className="text-sm text-white/70">
                          Durchschnittliche Ersparnis pro Jahr
                        </span>
                        <span className="font-light text-xl text-[var(--color--green)]">
                          {results.yearlyTotalSavings.toLocaleString('de-DE')} €
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-5">
                        <div className="text-xs font-medium uppercase tracking-wide text-[var(--w-tech-grey)] mb-1">
                          Amortisation nach
                        </div>
                        <div className="font-light text-3xl text-[#222222]">
                          {results.amortizationYears} Jahren
                        </div>
                      </div>

                      <div className="bg-white p-5">
                        <div className="text-xs font-medium uppercase tracking-wide text-[var(--w-tech-grey)] mb-1">
                          Gewinn nach 20 Jahren
                        </div>
                        <div className="font-light text-3xl text-[var(--w-blue)]">
                          {results.profitAfter20Years.toLocaleString('de-DE')} €
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-white/10 border border-white/20">
                      <p className="text-sm leading-relaxed text-white/80">
                        Ihre Investition hat sich nach etwa{' '}
                        <strong className="text-white">{results.amortizationYears} Jahren</strong>{' '}
                        amortisiert. Danach profitieren Sie Jahr für Jahr von niedrigen
                        Energiekosten und maximaler Unabhängigkeit von Strom- und Gaspreisen.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="text-center py-3 text-xs text-[var(--w-tech-grey)] border-t border-[var(--w-border)]">
        Daten &amp; Artikel rund um Photovoltaik:{' '}
        <a href="https://energiefluss24.de" rel="follow" className="hover:underline">
          energiefluss24.de
        </a>
      </div>
      <Footer />
    </div>
  );
}
