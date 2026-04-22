'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExpertSettings, defaultExpertSettings, migrateSettings } from '@/lib/calculations';

export default function AdminPage() {
  const [settings, setSettings] = useState<ExpertSettings>(defaultExpertSettings);

  useEffect(() => {
    // Load from localStorage and migrate if needed
    const saved = localStorage.getItem('expertSettings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      const migratedSettings = migrateSettings(parsedSettings);
      setSettings(migratedSettings);

      // Auto-save migrated settings
      if (migratedSettings.version !== parsedSettings.version) {
        localStorage.setItem('expertSettings', JSON.stringify(migratedSettings));
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('expertSettings', JSON.stringify(settings));
    alert('Einstellungen gespeichert!');
  };

  const handleReset = () => {
    setSettings(defaultExpertSettings);
    localStorage.removeItem('expertSettings');
    alert('Einstellungen zurückgesetzt!');
  };

  const updateCO2Tax = (year: number, price: number) => {
    setSettings(prev => ({
      ...prev,
      co2TaxSchedule: prev.co2TaxSchedule.map(item =>
        item.year === year ? { ...item, pricePerTon: price } : item
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--w-surface,#FEFBF9)]">
      {/* Flat topbar */}
      <div className="border-b border-[var(--w-border,#E5E0D7)] bg-[var(--w-surface,#FEFBF9)]">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-sm font-medium text-[#222222] tracking-wide">42watt Admin</span>
          <Link
            href="/"
            className="text-sm text-[var(--w-blue,#3445FF)] hover:underline"
          >
            Zurück zur App
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Title */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-[#888] mb-1">
            Experteneinstellungen
          </p>
          <h1 className="text-3xl font-light text-[#222222]">
            Einstellungen
          </h1>
        </div>

        {/* Technische Annahmen */}
        <div className="border border-[var(--w-border,#E5E0D7)] bg-white p-6 mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[#888] mb-1">
            Abschnitt 1
          </p>
          <h2 className="text-xl font-light text-[#222222] mb-6">
            Technische Annahmen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Spezifischer PV-Ertrag (kWh/kWp/Jahr)
              </label>
              <input
                type="number"
                value={settings.pvYieldPerKwp}
                onChange={(e) =>
                  setSettings({ ...settings, pvYieldPerKwp: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
              <p className="text-xs text-[#888] mt-1">
                Typisch: 800–1000 je nach Region (inkl. Verluste)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Wirkungsgrad Wärmepumpe (JAZ)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.heatPumpJAZ}
                onChange={(e) =>
                  setSettings({ ...settings, heatPumpJAZ: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
              <p className="text-xs text-[#888] mt-1">
                Typisch: 3.0–3.8 (realistisch mit Wärmepumpe)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Basis-Autarkie ohne Speicher/EMS (%)
              </label>
              <input
                type="number"
                value={settings.baseAutarky}
                onChange={(e) =>
                  setSettings({ ...settings, baseAutarky: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
              <p className="text-xs text-[#888] mt-1">
                Typisch: 25–35%
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Steigerung durch Speicher (%)
              </label>
              <input
                type="number"
                value={settings.batteryAutarkyBoost}
                onChange={(e) =>
                  setSettings({ ...settings, batteryAutarkyBoost: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
              <p className="text-xs text-[#888] mt-1">
                Typisch: 15–25% zusätzlich (mit WP eher 15–20%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Steigerung durch EMS (%)
              </label>
              <input
                type="number"
                value={settings.emsAutarkyBoost}
                onChange={(e) =>
                  setSettings({ ...settings, emsAutarkyBoost: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
              <p className="text-xs text-[#888] mt-1">
                Typisch: 5–10% zusätzlich (realistisch konservativ)
              </p>
            </div>
          </div>
        </div>

        {/* Preis- & Kostenannahmen */}
        <div className="border border-[var(--w-border,#E5E0D7)] bg-white p-6 mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[#888] mb-1">
            Abschnitt 2
          </p>
          <h2 className="text-xl font-light text-[#222222] mb-6">
            Preis- &amp; Kostenannahmen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Einspeisevergütung (ct/kWh)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.feedInTariff}
                onChange={(e) =>
                  setSettings({ ...settings, feedInTariff: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                CO&#8322;-Emissionen Gas (kg/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.co2EmissionsGas}
                onChange={(e) =>
                  setSettings({ ...settings, co2EmissionsGas: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
              <p className="text-xs text-[#888] mt-1">
                Typisch: 0.2 kg/kWh
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Jährliche Strompreissteigerung (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.electricityPriceIncrease}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    electricityPriceIncrease: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1">
                Jährliche Gaspreissteigerung (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.gasPriceIncrease}
                onChange={(e) =>
                  setSettings({ ...settings, gasPriceIncrease: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Additional Cost Checkboxes */}
          <div className="divide-y divide-[var(--w-border,#E5E0D7)] border-t border-[var(--w-border,#E5E0D7)]">
            <label className="flex items-start gap-3 cursor-pointer py-4">
              <input
                type="checkbox"
                checked={settings.includeMaintenanceCosts}
                onChange={(e) =>
                  setSettings({ ...settings, includeMaintenanceCosts: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 accent-[var(--w-blue,#3445FF)]"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-[#222222]">
                  Wartungskosten einberechnen
                </span>
                <p className="text-xs text-[#888] mt-0.5">
                  299 €/Jahr für Wartung und Reinigung der PV-Anlage
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer py-4">
              <input
                type="checkbox"
                checked={settings.includeInverterReplacement}
                onChange={(e) =>
                  setSettings({ ...settings, includeInverterReplacement: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 accent-[var(--w-blue,#3445FF)]"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-[#222222]">
                  Wechselrichter-Austausch einberechnen
                </span>
                <p className="text-xs text-[#888] mt-0.5">
                  200 €/Jahr Rücklage (3.000 € Austausch nach 15 Jahren)
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer py-4">
              <input
                type="checkbox"
                checked={settings.includeBatteryDegradation}
                onChange={(e) =>
                  setSettings({ ...settings, includeBatteryDegradation: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 accent-[var(--w-blue,#3445FF)]"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-[#222222]">
                  Speicher-Degradation berücksichtigen
                </span>
                <p className="text-xs text-[#888] mt-0.5">
                  1.5%/Jahr Kapazitätsverlust (ab Jahr 5, realistisch)
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer py-4">
              <input
                type="checkbox"
                checked={settings.includeChimneySweep}
                onChange={(e) =>
                  setSettings({ ...settings, includeChimneySweep: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 accent-[var(--w-blue,#3445FF)]"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-[#222222]">
                  Kaminkehrer-Kosten entfallen
                </span>
                <p className="text-xs text-[#888] mt-0.5">
                  100 €/Jahr Ersparnis durch Wegfall des Kaminkehrers mit Wärmepumpe
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* CO2-Steuer Zeitplan */}
        <div className="border border-[var(--w-border,#E5E0D7)] bg-white p-6 mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-[#888] mb-1">
            Abschnitt 3
          </p>
          <h2 className="text-xl font-light text-[#222222] mb-6">
            CO&#8322;-Steuer Zeitplan
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {settings.co2TaxSchedule.map((item) => (
              <div key={item.year}>
                <label className="block text-xs font-medium text-[#888] mb-1 uppercase tracking-wide">
                  {item.year}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={item.pricePerTon}
                    onChange={(e) => updateCO2Tax(item.year, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 pr-7 border border-[var(--w-border,#E5E0D7)] bg-white text-[#222222] focus:border-[var(--w-blue,#3445FF)] focus:outline-none text-sm"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#888]">
                    €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSave}
            className="bg-[var(--w-blue,#3445FF)] text-white px-6 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Einstellungen speichern
          </button>
          <button
            onClick={handleReset}
            className="border border-[var(--w-border,#E5E0D7)] text-[#222222] px-6 py-2 text-sm font-medium hover:bg-[var(--w-border,#E5E0D7)] transition-colors"
          >
            Zurücksetzen
          </button>
        </div>

        {/* Info Box */}
        <div className="border border-[var(--w-blue,#3445FF)] p-5 bg-white">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--w-blue,#3445FF)] mb-1">
            Hinweis
          </p>
          <p className="text-sm text-[#222222]">
            Diese Einstellungen werden im Browser-Speicher gespeichert und gelten für den
            PV &amp; Wärmepumpe Rechner. Die Kundenansicht verwendet diese Werte automatisch.
          </p>
        </div>
      </div>
    </div>
  );
}
