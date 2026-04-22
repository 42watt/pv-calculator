'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface FoerderInputs {
  buildingType: 'single_family_home' | 'multi_family_home' | 'condominium_assoc' | '';
  residentialUnits: number;
  selfUse: boolean;
  ownershipShare: number;
  totalCosts: number;
  heatPumpType: 'air' | 'ground' | 'water';
  oldHeatingType: 'oel' | 'gasetagen' | 'kohle' | 'nachtspeicher' | 'gaskessel' | 'biomasse' | 'other' | '';
  oldHeatingAge: 'older_20' | 'younger_20' | '';
  incomeBracket: 'over_40k' | 'under_40k';
  naturalRefrigerant: boolean;
}

interface BonusData {
  rate: number;
  granted: boolean;
  reason?: string;
}

interface CalculationResult {
  totalFunding: number;
  eligibleCosts: number;
  finalRate: number;
  bonuses: {
    efficiency: BonusData;
    speed: BonusData;
    income: BonusData;
  };
  commonFunding?: number;
  personalFunding?: number;
  userShareOfCommon?: number;
}

export default function WaermepumpenFoerderrechner() {
  const [inputs, setInputs] = useState<FoerderInputs>({
    buildingType: '',
    residentialUnits: 1,
    selfUse: false,
    ownershipShare: 0,
    totalCosts: 0,
    heatPumpType: 'air',
    oldHeatingType: '',
    oldHeatingAge: '',
    incomeBracket: 'over_40k',
    naturalRefrigerant: false,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string>('');

  const CONFIG = {
    RATES: { base: 30, efficiency: 5, speed: 20, income: 30 },
    MAX_RATES: { self_occupier: 70, landlord: 35 },
  };

  const isSelfOccupier =
    inputs.buildingType === 'single_family_home' ||
    inputs.buildingType === 'condominium_assoc' ||
    (inputs.buildingType === 'multi_family_home' && inputs.selfUse);

  const showBonusQuestions = isSelfOccupier;

  const getMaxEligibleCosts = (units: number): number => {
    if (!units || units <= 1) return 30000;
    let costs = 30000 + Math.min(5, units - 1) * 15000;
    if (units > 6) {
      costs += (units - 6) * 8000;
    }
    return costs;
  };

  const determineBonuses = (inp: FoerderInputs): CalculationResult['bonuses'] => {
    const defaultBonus = (reason = ''): BonusData => ({ rate: 0, granted: false, reason });
    const bonuses = {
      efficiency: defaultBonus('Voraussetzungen nicht erfüllt'),
      speed: defaultBonus('Nur für Selbstnutzer anwendbar'),
      income: defaultBonus('Nur für Selbstnutzer anwendbar'),
    };

    // Effizienzbonus
    if (
      isSelfOccupier &&
      (inp.heatPumpType === 'ground' || inp.heatPumpType === 'water' || inp.naturalRefrigerant)
    ) {
      bonuses.efficiency = { rate: CONFIG.RATES.efficiency, granted: true };
    } else if (!isSelfOccupier) {
      bonuses.efficiency.reason =
        'Für eine Prüfung sind weitere Angaben nötig (im Rechner nur für Selbstnutzer).';
    }

    if (!isSelfOccupier) return bonuses;

    // Klimageschwindigkeitsbonus
    const quickBonusTypes = ['gasetagen', 'oel', 'kohle', 'nachtspeicher'];
    const ageDependentTypes = ['gaskessel', 'biomasse'];
    let speedGranted = false;

    if (quickBonusTypes.includes(inp.oldHeatingType)) {
      speedGranted = true;
    }
    if (ageDependentTypes.includes(inp.oldHeatingType) && inp.oldHeatingAge === 'older_20') {
      speedGranted = true;
    }

    bonuses.speed = speedGranted
      ? { rate: CONFIG.RATES.speed, granted: true }
      : defaultBonus('Heizungstyp/-alter nicht bonusrelevant');

    // Einkommensbonus
    bonuses.income =
      inp.incomeBracket === 'under_40k'
        ? { rate: CONFIG.RATES.income, granted: true }
        : defaultBonus('Einkommen > 40.000 €');

    return bonuses;
  };

  const calculateFunding = (): CalculationResult | null => {
    setError('');

    // Validierung
    if (!inputs.buildingType) {
      setError('Bitte wählen Sie einen Gebäudetyp aus.');
      return null;
    }

    if (!inputs.totalCosts || inputs.totalCosts <= 0) {
      setError('Bitte geben Sie gültige Gesamtkosten an.');
      return null;
    }

    if (
      (inputs.buildingType === 'multi_family_home' || inputs.buildingType === 'condominium_assoc') &&
      (!inputs.residentialUnits || inputs.residentialUnits < 2)
    ) {
      setError('Bitte geben Sie für ein MFH/WEG mind. 2 Wohneinheiten an.');
      return null;
    }

    if (
      inputs.buildingType === 'condominium_assoc' &&
      (!inputs.ownershipShare || inputs.ownershipShare <= 0)
    ) {
      setError('Bitte geben Sie Ihren Miteigentumsanteil an.');
      return null;
    }

    if (isSelfOccupier && !inputs.oldHeatingType) {
      setError('Bitte geben Sie die bestehende Heizung an.');
      return null;
    }

    const ageDependentTypes = ['gaskessel', 'biomasse'];
    if (
      isSelfOccupier &&
      ageDependentTypes.includes(inputs.oldHeatingType) &&
      !inputs.oldHeatingAge
    ) {
      setError('Bitte geben Sie das Alter Ihrer Gas-/Biomasseheizung an.');
      return null;
    }

    const bonuses = determineBonuses(inputs);
    const units = inputs.residentialUnits;
    const maxEligibleCosts = getMaxEligibleCosts(units);
    const eligibleCosts = Math.min(inputs.totalCosts, maxEligibleCosts);

    const baseRate = CONFIG.RATES.base + bonuses.efficiency.rate;
    const personalBonusRate = bonuses.speed.rate + bonuses.income.rate;

    const totalRate = baseRate + personalBonusRate;
    const maxRate = isSelfOccupier ? CONFIG.MAX_RATES.self_occupier : CONFIG.MAX_RATES.landlord;
    const finalRate = Math.min(totalRate, maxRate);

    const calcResult: CalculationResult = {
      eligibleCosts,
      finalRate,
      bonuses,
      totalFunding: 0,
    };

    // Check if we need to split funding (multiple units with self-occupation)
    const needsSplit = units > 1 && isSelfOccupier;

    if (needsSplit) {
      const commonRate = CONFIG.RATES.base + bonuses.efficiency.rate;
      const commonFunding = eligibleCosts * (commonRate / 100);

      const personalCostBase = eligibleCosts / units;
      const maxPersonalBonusRate = CONFIG.MAX_RATES.self_occupier - commonRate;
      const finalPersonalBonusRate = Math.min(personalBonusRate, maxPersonalBonusRate);
      const personalFunding = personalCostBase * (finalPersonalBonusRate / 100);

      calcResult.commonFunding = commonFunding;
      calcResult.personalFunding = personalFunding;

      if (inputs.buildingType === 'condominium_assoc') {
        const userShareOfCommon = commonFunding * (inputs.ownershipShare / 100);
        calcResult.userShareOfCommon = userShareOfCommon;
        calcResult.totalFunding = userShareOfCommon + personalFunding;
      } else {
        calcResult.totalFunding = commonFunding + personalFunding;
      }
    } else {
      calcResult.totalFunding = eligibleCosts * (finalRate / 100);
    }

    return calcResult;
  };

  const handleCalculate = () => {
    const calcResult = calculateFunding();
    setResult(calcResult);
  };

  const handleInputChange = (field: keyof FoerderInputs, value: string | number | boolean) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);

  const isAgeRelevant = inputs.oldHeatingType === 'gaskessel' || inputs.oldHeatingType === 'biomasse';

  const inputClass =
    'w-full px-3 py-2.5 border border-[var(--w-border)] bg-white focus:border-[var(--w-blue)] focus:outline-none text-[#222222] text-sm';
  const labelClass = 'block text-xs font-medium text-[#666] uppercase tracking-wide mb-1.5';

  return (
    <div className="min-h-screen bg-[var(--w-surface)]">
      <Header currentPage="kfw" />

      <main>
        {/* Page header */}
        <div className="max-w-4xl mx-auto pt-10 px-4">
          <p className="text-xs font-medium text-[var(--w-blue)] uppercase tracking-widest mb-2">
            BEG EM 2024
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-[#222222] mb-2">
            Wärmepumpen-Förderrechner
          </h1>
          <p className="text-sm text-[#666] mb-8">
            Berechnen Sie Ihre maximale KfW-Förderung für den Einbau einer Wärmepumpe
          </p>
        </div>

        <div className="max-w-4xl mx-auto pb-16 px-4">

          {/* ── Section 1: Gebäudedaten ── */}
          <div className="border border-[var(--w-border)] bg-white mb-4">
            <div className="px-6 py-4 border-b border-[var(--w-border)] flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--w-blue)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
              <h2 className="text-sm font-semibold text-[#222222] uppercase tracking-wide">Gebäudedaten</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Gebäudetyp</label>
                <select
                  value={inputs.buildingType}
                  onChange={(e) =>
                    handleInputChange('buildingType', e.target.value as FoerderInputs['buildingType'])
                  }
                  className={inputClass}
                >
                  <option value="">Bitte wählen…</option>
                  <option value="single_family_home">Einfamilienhaus</option>
                  <option value="multi_family_home">Mehrfamilienhaus</option>
                  <option value="condominium_assoc">Wohnung in einer WEG</option>
                </select>
              </div>

              {inputs.buildingType && (
                <div>
                  <label className={labelClass}>
                    Anzahl Wohneinheiten
                    {inputs.buildingType === 'single_family_home' && (
                      <span className="ml-1 normal-case font-normal text-[#999]">(inkl. Einliegerwohnung)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inputs.residentialUnits || ''}
                    onChange={(e) =>
                      handleInputChange('residentialUnits', parseInt(e.target.value) || 0)
                    }
                    placeholder={inputs.buildingType === 'single_family_home' ? 'z.B. 1 oder 2' : 'z.B. 10'}
                    className={inputClass}
                  />
                </div>
              )}

              {inputs.buildingType === 'multi_family_home' && (
                <div>
                  <label className={labelClass}>Bewohnen Sie eine der Einheiten?</label>
                  <select
                    value={inputs.selfUse ? 'yes' : 'no'}
                    onChange={(e) => handleInputChange('selfUse', e.target.value === 'yes')}
                    className={inputClass}
                  >
                    <option value="no">Nein (reine Vermietung)</option>
                    <option value="yes">Ja (mind. eine Einheit selbst genutzt)</option>
                  </select>
                </div>
              )}

              {inputs.buildingType === 'condominium_assoc' && (
                <div>
                  <label className={labelClass}>Ihr Miteigentumsanteil (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={inputs.ownershipShare || ''}
                    onChange={(e) =>
                      handleInputChange('ownershipShare', parseInt(e.target.value) || 0)
                    }
                    placeholder="z.B. 8"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Persönliche Boni ── */}
          {showBonusQuestions && (
            <div className="border border-[var(--w-border)] bg-white mb-4">
              <div className="px-6 py-4 border-b border-[var(--w-border)] flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--w-blue)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <h2 className="text-sm font-semibold text-[#222222] uppercase tracking-wide">Persönliche Boni</h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Neue Wärmequelle</label>
                  <select
                    value={inputs.heatPumpType}
                    onChange={(e) =>
                      handleInputChange('heatPumpType', e.target.value as FoerderInputs['heatPumpType'])
                    }
                    className={inputClass}
                  >
                    <option value="air">Luft</option>
                    <option value="ground">Erdreich (Sole)</option>
                    <option value="water">Wasser / Abwasser</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Bestehende Heizung</label>
                  <select
                    value={inputs.oldHeatingType}
                    onChange={(e) =>
                      handleInputChange('oldHeatingType', e.target.value as FoerderInputs['oldHeatingType'])
                    }
                    className={inputClass}
                  >
                    <option value="">Bitte wählen…</option>
                    <option value="oel">Ölheizung</option>
                    <option value="gasetagen">Gasetagenheizung</option>
                    <option value="kohle">Kohleheizung</option>
                    <option value="nachtspeicher">Nachtspeicherheizung</option>
                    <option value="gaskessel">Gas-Zentralheizung</option>
                    <option value="biomasse">Biomasseheizung</option>
                    <option value="other">Andere</option>
                  </select>
                </div>

                <div
                  className={
                    isAgeRelevant
                      ? 'md:col-span-2 border border-[var(--w-blue)] bg-blue-50 p-4'
                      : 'md:col-span-2'
                  }
                >
                  <label className={labelClass}>Alter der Gas-/Biomasseheizung</label>
                  <select
                    value={inputs.oldHeatingAge}
                    onChange={(e) =>
                      handleInputChange('oldHeatingAge', e.target.value as FoerderInputs['oldHeatingAge'])
                    }
                    disabled={!isAgeRelevant}
                    className={`${inputClass} disabled:bg-[#f5f3f0] disabled:text-[#aaa] disabled:cursor-not-allowed`}
                  >
                    <option value="">Bitte wählen…</option>
                    <option value="older_20">Mindestens 20 Jahre</option>
                    <option value="younger_20">Jünger als 20 Jahre</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Zu versteuerndes Haushaltseinkommen</label>
                  <select
                    value={inputs.incomeBracket}
                    onChange={(e) =>
                      handleInputChange('incomeBracket', e.target.value as FoerderInputs['incomeBracket'])
                    }
                    className={inputClass}
                  >
                    <option value="over_40k">Über 40.000 €</option>
                    <option value="under_40k">Bis 40.000 €</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.naturalRefrigerant}
                      onChange={(e) => handleInputChange('naturalRefrigerant', e.target.checked)}
                      className="w-4 h-4 accent-[var(--w-blue)]"
                    />
                    <span className="text-sm text-[#222222]">
                      Die neue Wärmepumpe nutzt ein natürliches Kältemittel (z.B. Propan R290).
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Section 3: Kosten ── */}
          <div className="border border-[var(--w-border)] bg-white mb-6">
            <div className="px-6 py-4 border-b border-[var(--w-border)] flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--w-blue)] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {showBonusQuestions ? '3' : '2'}
              </span>
              <h2 className="text-sm font-semibold text-[#222222] uppercase tracking-wide">Förderfähige Gesamtkosten</h2>
            </div>

            <div className="p-6">
              <input
                type="number"
                value={inputs.totalCosts || ''}
                onChange={(e) => handleInputChange('totalCosts', parseFloat(e.target.value) || 0)}
                placeholder="z.B. 35000"
                className={`${inputClass} text-base`}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 border border-red-300 bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-[var(--w-blue)] text-white font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Förderung berechnen
          </button>

          {/* Disclaimer */}
          <p className="mt-4 text-center text-xs text-[#999]">
            Alle Angaben ohne Gewähr. Der Förderrechner ist ein freiwilliger und unverbindlicher
            Service der Enovato GmbH (42watt).
          </p>

          {/* ── Results ── */}
          {result && (
            <div className="mt-8 border border-[var(--w-border)]">
              {/* Hero total */}
              <div className="bg-[var(--w-blue)] px-6 py-8 text-center text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">
                  {inputs.buildingType === 'condominium_assoc'
                    ? 'Ihr persönlicher Gesamtvorteil'
                    : inputs.residentialUnits > 1 && isSelfOccupier
                    ? 'Gesamtförderung (Gemeinschaft + Ihr Bonus)'
                    : 'Voraussichtliche Gesamtförderung'}
                </p>
                <div className="text-5xl font-light tracking-tight mb-1">
                  {formatCurrency(result.totalFunding)}
                </div>
                {inputs.residentialUnits > 1 && (
                  <p className="text-sm text-blue-200 mt-2">
                    Pro Wohneinheit: {formatCurrency(result.totalFunding / inputs.residentialUnits)}
                  </p>
                )}
              </div>

              <div className="bg-white">
                {/* Funding breakdown (only if split) */}
                {result.commonFunding !== undefined && result.personalFunding !== undefined && (
                  <div className="border-b border-[var(--w-border)] px-6 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#666] mb-3">
                      Förderungsaufschlüsselung
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#666]">Gemeinschaftsförderung (Basis + Effizienz)</span>
                        <span className="font-medium text-[#222222]">{formatCurrency(result.commonFunding)}</span>
                      </div>
                      {inputs.buildingType === 'condominium_assoc' && result.userShareOfCommon !== undefined && (
                        <div className="flex justify-between pl-4 text-xs text-[#999]">
                          <span>Ihr Anteil ({inputs.ownershipShare}%)</span>
                          <span className="font-medium">{formatCurrency(result.userShareOfCommon)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#666]">
                          {inputs.buildingType === 'condominium_assoc'
                            ? 'Ihr persönlicher Bonus'
                            : 'Persönliche Boni (pro WE)'}
                        </span>
                        <span className="font-medium text-[#222222]">{formatCurrency(result.personalFunding)}</span>
                      </div>
                      {inputs.residentialUnits > 1 && (
                        <div className="flex justify-between pl-4 text-xs text-[#999]">
                          <span>Förderung pro Wohneinheit</span>
                          <span className="font-medium">{formatCurrency(result.totalFunding / inputs.residentialUnits)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bonus rows */}
                <div className="divide-y divide-[var(--w-border)]">
                  {/* Basisförderung / WEG-Anteil */}
                  {inputs.buildingType === 'condominium_assoc' && result.userShareOfCommon !== undefined ? (
                    <BonusRow
                      granted={true}
                      label="Ihr Anteil an der Gemeinschaftsförderung"
                      value={formatCurrency(result.userShareOfCommon)}
                    />
                  ) : (
                    <BonusRow
                      granted={true}
                      label="Grundförderung"
                      value={`${CONFIG.RATES.base}%`}
                    />
                  )}

                  {/* Effizienzbonus (hidden for WEG) */}
                  {inputs.buildingType !== 'condominium_assoc' && (
                    <BonusRow
                      granted={result.bonuses.efficiency.granted}
                      label="Effizienzbonus"
                      reason={result.bonuses.efficiency.reason}
                      value={result.bonuses.efficiency.granted ? `${result.bonuses.efficiency.rate}%` : '0%'}
                    />
                  )}

                  {/* Klimageschwindigkeitsbonus */}
                  <BonusRow
                    granted={result.bonuses.speed.granted}
                    label={
                      inputs.buildingType === 'condominium_assoc'
                        ? 'Ihr persönlicher Klimabonus'
                        : 'Klimageschwindigkeitsbonus'
                    }
                    reason={result.bonuses.speed.reason}
                    value={result.bonuses.speed.granted ? `${result.bonuses.speed.rate}%` : '0%'}
                  />

                  {/* Einkommensbonus */}
                  <BonusRow
                    granted={result.bonuses.income.granted}
                    label={
                      inputs.buildingType === 'condominium_assoc'
                        ? 'Ihr persönlicher Einkommensbonus'
                        : 'Einkommensbonus'
                    }
                    reason={result.bonuses.income.reason}
                    value={result.bonuses.income.granted ? `${result.bonuses.income.rate}%` : '0%'}
                  />
                </div>

                {/* Eigenanteil */}
                <div className="px-6 py-4 border-t border-[var(--w-border)] flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#222222]">Ihr voraussichtlicher Eigenanteil</span>
                  <span className="text-lg font-bold text-[#222222]">
                    {formatCurrency(
                      inputs.buildingType === 'condominium_assoc'
                        ? inputs.totalCosts * (inputs.ownershipShare / 100) - result.totalFunding
                        : inputs.totalCosts - result.totalFunding
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Informationen zur Förderung ── */}
          <div className="mt-10 border border-[var(--w-border)] bg-white">
            <div className="px-6 py-5 border-b border-[var(--w-border)]">
              <h2 className="text-xl font-light text-[#222222]">
                Details zur Wärmepumpen-Förderung (BEG EM)
              </h2>
            </div>

            {/* Förderkomponenten */}
            <div className="px-6 py-6 border-b border-[var(--w-border)]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#666] mb-4">
                Förderkomponenten im Überblick
              </h3>
              <p className="text-sm text-[#666] mb-5">
                Die Förderung setzt sich aus einer Grundförderung und optionalen Boni zusammen. Die Summe aller Komponenten ist auf einen maximalen Fördersatz von 70 % gedeckelt.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-[var(--w-border)]">
                      <th className="text-left py-2 pr-4 font-semibold text-[#222222]">Komponente</th>
                      <th className="text-left py-2 pr-4 font-semibold text-[#222222] whitespace-nowrap">Zuschuss</th>
                      <th className="text-left py-2 font-semibold text-[#222222]">Voraussetzungen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: 'Grundförderung',
                        rate: '30 %',
                        desc: 'Für jede förderfähige Installation einer klimafreundlichen Heizung.',
                      },
                      {
                        name: 'Klimageschwindigkeits-Bonus',
                        rate: '20 %',
                        desc: 'Nur für Selbstnutzer beim Austausch einer funktionstüchtigen fossilen oder mind. 20 Jahre alten Biomasseheizung.',
                      },
                      {
                        name: 'Effizienz-Bonus',
                        rate: '5 %',
                        desc: 'Bei Nutzung von Wasser, Erdreich oder Abwasser als Wärmequelle oder bei Einsatz eines natürlichen Kältemittels.',
                      },
                      {
                        name: 'Einkommens-Bonus',
                        rate: '30 %',
                        desc: 'Nur für Selbstnutzer mit einem zu versteuernden Haushaltseinkommen von max. 40.000 € pro Jahr.',
                      },
                    ].map((row) => (
                      <tr key={row.name} className="border-b border-[var(--w-border)]">
                        <td className="py-3 pr-4 font-medium text-[#222222] whitespace-nowrap">{row.name}</td>
                        <td className="py-3 pr-4 font-bold text-[var(--w-blue)] whitespace-nowrap">{row.rate}</td>
                        <td className="py-3 text-[#666]">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Förderfähige Kosten */}
            <div className="px-6 py-6 border-b border-[var(--w-border)]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#666] mb-4">
                Förderfähige Kosten & Höchstgrenzen
              </h3>
              <p className="text-sm text-[#666] mb-4">
                Nicht nur die Wärmepumpe selbst, sondern auch viele notwendige Nebenarbeiten (&quot;Umfeldmaßnahmen&quot;) sind förderfähig. Dazu zählen:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  'Fachplanung und Baubegleitung',
                  'Installation und Inbetriebnahme',
                  'Bohrungen für Erdsonden oder Brunnen',
                  'Demontage und Entsorgung der Altanlage',
                  'Optimierung des Heizsystems (z.B. neue Heizkörper, Pufferspeicher)',
                  'Durchführung des hydraulischen Abgleichs',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="text-[var(--w-blue)] font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-[#666]">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-[#666] mb-4">
                Die anrechenbaren Kosten sind nach der Anzahl der Wohneinheiten (WE) gestaffelt:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-[var(--w-border)]">
                      <th className="text-left py-2 pr-4 font-semibold text-[#222222]">Wohneinheit</th>
                      <th className="text-left py-2 pr-4 font-semibold text-[#222222]">Höchstgrenze</th>
                      <th className="text-left py-2 font-semibold text-[#222222]">Max. Zuschuss (bei 70%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Erste Wohneinheit', limit: '30.000 €', max: '21.000 €' },
                      { label: 'Zweite bis sechste WE (je)', limit: '15.000 €', max: '10.500 €' },
                      { label: 'Ab der siebten WE (je)', limit: '8.000 €', max: '5.600 €' },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-[var(--w-border)]">
                        <td className="py-3 pr-4 text-[#222222]">{row.label}</td>
                        <td className="py-3 pr-4 font-medium text-[#222222]">{row.limit}</td>
                        <td className="py-3 font-medium text-[#222222]">{row.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Antragsprozess */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#666] mb-4">
                Der Antragsprozess Schritt für Schritt
              </h3>
              <p className="text-sm text-[#666] mb-5">
                Der Antrag muss grundsätzlich <strong>vor Beginn der Maßnahmen</strong> bei der KfW eingereicht werden. Der Ablauf ist wie folgt:
              </p>
              <ol className="space-y-4">
                {[
                  {
                    title: 'Angebot & Vertrag',
                    desc: 'Holen Sie ein Angebot ein und schließen Sie einen Lieferungs-/Leistungsvertrag mit Ihrem Fachbetrieb ab. Wichtig: Der Vertrag muss eine Klausel enthalten, die ihn an die Förderzusage bindet (aufschiebende oder auflösende Bedingung).',
                  },
                  {
                    title: 'Bestätigung zum Antrag (BzA)',
                    desc: 'Ihr Fachbetrieb oder ein Energie-Effizienz-Experte erstellt die BzA. Dieses Dokument bestätigt die Förderfähigkeit Ihres Vorhabens.',
                  },
                  {
                    title: 'Antrag bei der KfW stellen',
                    desc: 'Mit der BzA registrieren Sie sich im Kundenportal "Meine KfW" und stellen dort den eigentlichen Förderantrag.',
                  },
                  {
                    title: 'Maßnahmenbeginn',
                    desc: 'Nach Erhalt der Antragsbestätigung von der KfW können Sie mit der Installation beginnen.',
                  },
                  {
                    title: 'Nachweise & Auszahlung',
                    desc: 'Nach Abschluss des Projekts reichen Sie die Rechnungen und weitere Nachweise im KfW-Portal ein. Nach erfolgreicher Prüfung wird Ihnen der Zuschuss ausgezahlt.',
                  },
                ].map((step, i) => (
                  <li key={step.title} className="flex gap-4 text-sm">
                    <span className="w-6 h-6 rounded-full border border-[var(--w-blue)] text-[var(--w-blue)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <strong className="text-[#222222]">{step.title}:</strong>{' '}
                      <span className="text-[#666]">{step.desc}</span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 px-4 py-3 border-l-2 border-[var(--w-blue)] bg-blue-50 text-sm text-[#222222]">
                <strong>Wichtig:</strong> Die Beauftragung des Fachbetriebs gilt bereits als Maßnahmenbeginn. Schließen Sie den Vertrag daher erst, nachdem Sie den Förderantrag gestellt haben, es sei denn, er enthält die oben genannte Förder-Bedingung.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Shared bonus row component ──
function BonusRow({
  granted,
  label,
  value,
  reason,
}: {
  granted: boolean;
  label: string;
  value: string;
  reason?: string;
}) {
  return (
    <div className="flex justify-between items-center px-6 py-3">
      <div className="flex items-start gap-3">
        <span
          className={`text-sm font-bold flex-shrink-0 mt-0.5 ${granted ? 'text-[var(--w-blue)]' : 'text-[#ccc]'}`}
        >
          {granted ? '✓' : '✗'}
        </span>
        <div>
          <span className={`text-sm ${granted ? 'text-[#222222]' : 'text-[#999]'}`}>{label}</span>
          {!granted && reason && (
            <div className="text-xs text-[#bbb] mt-0.5">{reason}</div>
          )}
        </div>
      </div>
      <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${granted ? 'text-[#222222]' : 'text-[#ccc]'}`}>
        {value}
      </span>
    </div>
  );
}
