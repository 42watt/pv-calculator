// Types
export interface CustomerInputs {
  householdConsumption: number; // kWh
  heatingConsumption: number; // kWh (Gas/Oil)
  heatingType: 'gas' | 'oil'; // Heizungstyp: Gas oder Öl
  hasECar: boolean;
  eCarKm: number; // km per year
  pvSize: number; // kWp
  batterySize: number; // kWh
  hasEMS: boolean; // Energy Management System
  totalInvestment: number; // €
  electricityPrice: number; // ct/kWh
  gasPrice: number; // ct/kWh
  oilPrice: number; // ct/kWh
}

export interface ExpertSettings {
  version?: number; // Settings version for migration
  pvYieldPerKwp: number; // kWh/kWp/year
  heatPumpJAZ: number; // Coefficient of Performance
  baseAutarky: number; // % without battery/EMS
  batteryAutarkyBoost: number; // % increase with battery
  emsAutarkyBoost: number; // % increase with EMS
  emsHeatPumpPvCoverage: number; // % WP coverage from PV with EMS (default 70%)
  emsMaxSelfConsumptionShare: number; // % max self-consumption to WP with EMS (default 75%)
  feedInTariff: number; // ct/kWh
  electricityPriceIncrease: number; // % per year
  gasPriceIncrease: number; // % per year
  co2TaxSchedule: { year: number; pricePerTon: number }[];
  co2EmissionsGas: number; // kg CO2 per kWh gas
  includeMaintenanceCosts: boolean; // Wartungskosten einberechnen
  includeInverterReplacement: boolean; // Wechselrichter-Austausch einberechnen
  includeBatteryDegradation: boolean; // Speicher-Degradation berücksichtigen
  includeChimneySweep: boolean; // Kaminkehrer-Kosten (entfallen mit Wärmepumpe)
}

export interface CalculationResults {
  // Annual savings
  yearlyElectricitySavings: number;
  yearlyFeedInRevenue: number;
  emsBonus: number;
  yearlyHeatingSavings: number;
  chimneySweepSavings: number;
  yearlyTotalSavings: number;

  // System performance
  pvProduction: number; // kWh/year
  selfConsumption: number; // kWh/year
  feedIn: number; // kWh/year
  autarkyRate: number; // %
  selfConsumptionRate: number; // %

  // E-Car
  eCarConsumption: number; // kWh/year

  // Heat pump
  heatPumpConsumption: number; // kWh/year

  // Total consumption
  totalElectricityDemand: number; // kWh/year
  gridElectricity: number; // kWh/year (what needs to be bought)

  // Heating comparison (10 years)
  heatingComparison: {
    year: number;
    gasCosts: number;
    heatPumpCosts: number;
    savings: number;
  }[];

  // Amortization
  amortizationYears: number;
  profitAfter20Years: number;
}

export function calculateSystem(
  customer: CustomerInputs,
  expert: ExpertSettings
): CalculationResults {
  // 1. PV Production
  const pvProduction = customer.pvSize * expert.pvYieldPerKwp;

  // 2. E-Car consumption (20 kWh per 100km)
  const eCarConsumption = customer.hasECar
    ? (customer.eCarKm / 100) * 20
    : 0;

  // 3. Heat pump consumption
  // Gas consumption / JAZ = electricity needed
  const heatPumpConsumption = customer.heatingConsumption / expert.heatPumpJAZ;

  // 4. Total electricity demand
  const totalElectricityDemand =
    customer.householdConsumption +
    eCarConsumption +
    heatPumpConsumption;

  // 5. Self-consumption calculation
  // Base autarky + increase from battery and/or EMS

  // ✅ Exponentielles Sättigungsmodell (bildet abnehmenden Grenznutzen ab)
  // Kleine Speicher (2-4 kWh): Schneller Anstieg (~15-20%)
  // Mittlere Speicher (6-8 kWh): Abflachung (~22-24%)
  // Große Speicher (10+ kWh): Sättigung bei ~21.6%
  const batteryBoost = customer.batterySize > 0
    ? expert.batteryAutarkyBoost * (1 - Math.exp(-customer.batterySize / 5))
    : 0;

  const emsBoost = customer.hasEMS ? expert.emsAutarkyBoost : 0;

  // ✅ Max-Autarkie auf 85% gedeckelt (realistisch für Jahresbilanz mit Winter-Defiziten)
  const autarkyRate = Math.min(
    expert.baseAutarky + batteryBoost + emsBoost,
    85 // Max 85% autarky (vorher 95%)
  );

  // 🔍 DEBUG: Autarkie-Berechnung
  if (typeof window !== 'undefined') {
    console.group('🔍 Autarky Calculation');
    console.log('Base Autarky:', expert.baseAutarky, '%');
    console.log('Battery Size:', customer.batterySize, 'kWh');
    console.log('Battery Boost:', batteryBoost.toFixed(1), '%', '(exponential saturation)');
    console.log('EMS Active:', customer.hasEMS);
    console.log('EMS Boost:', emsBoost, '%');
    console.log('Total before cap:', (expert.baseAutarky + batteryBoost + emsBoost).toFixed(1), '%');
    console.log('Final Autarky Rate:', autarkyRate, '%', '(max 85%)');
    console.groupEnd();
  }

  // Self-consumption: How much of PV is used directly
  // We assume the battery and EMS help to shift PV production to match consumption
  let selfConsumption = Math.min(
    pvProduction,
    totalElectricityDemand * (autarkyRate / 100)
  );

  // ✅ Speicherverluste berücksichtigen (10% Round-Trip-Verluste)
  if (customer.batterySize > 0) {
    const batteryUsage = Math.min(
      customer.batterySize * 365, // Maximale jährliche Nutzung (1x täglich)
      selfConsumption * 0.6 // Schätzung: 60% des Eigenverbrauchs läuft über Speicher
    );
    const batteryLosses = batteryUsage * 0.10; // 10% Verluste (konservativ)
    selfConsumption -= batteryLosses;
  }

  // Self-consumption rate: % of PV that is used
  const selfConsumptionRate = (selfConsumption / pvProduction) * 100;

  // Grid electricity needed
  const gridElectricity = totalElectricityDemand - selfConsumption;

  // Feed-in: Excess PV production
  const feedIn = Math.max(0, pvProduction - selfConsumption);

  // 🔍 DEBUG: Log critical values
  if (typeof window !== 'undefined') {
    console.group('🔍 PV Calculator Debug');
    console.log('Household:', customer.householdConsumption, 'kWh');
    console.log('Heat Pump:', heatPumpConsumption, 'kWh (', customer.heatingConsumption, '/', expert.heatPumpJAZ, ')');
    console.log('E-Car:', eCarConsumption, 'kWh');
    console.log('Total Demand:', totalElectricityDemand, 'kWh');
    console.log('PV Production:', pvProduction, 'kWh');
    console.log('Autarky Rate:', autarkyRate, '%');
    console.log('Self Consumption:', selfConsumption, 'kWh');
    console.log('Grid Electricity:', gridElectricity, 'kWh');
    console.log('Feed In:', feedIn, 'kWh');
    console.log('Electricity Price:', customer.electricityPrice, 'ct/kWh');
    console.log('Electricity Price Increase:', expert.electricityPriceIncrease, '%');
    console.log('Gas Price Increase:', expert.gasPriceIncrease, '%');
    console.groupEnd();
  }

  // 6. Annual savings
  const yearlyElectricitySavings =
    selfConsumption * (customer.electricityPrice / 100);

  const yearlyFeedInRevenue =
    feedIn * (expert.feedInTariff / 100);

  // ✅ EMS-Bonus: Zeigt den finanziellen Wert der 15% zusätzlichen Autarkie
  // Berechnung: Zusätzlicher Eigenverbrauch durch EMS × Strompreis
  let emsBonus = 0;
  if (customer.hasEMS) {
    // Zusätzlicher Eigenverbrauch durch EMS
    const additionalSelfConsumption = Math.min(
      pvProduction,
      totalElectricityDemand * (emsBoost / 100)
    );
    emsBonus = additionalSelfConsumption * (customer.electricityPrice / 100);
  }

  // Total yearly savings (including heat pump vs gas comparison - calculated below)
  const yearlyTotalSavings =
    yearlyElectricitySavings + yearlyFeedInRevenue;

  // 7. Heating comparison over 10 years
  const heatingComparison = [];

  for (let year = 1; year <= 10; year++) {
    const yearNumber = 2025 + (year - 1);

    // Gas/Oil costs with CO2 tax
    const co2Tax = expert.co2TaxSchedule.find(s => s.year === yearNumber);
    const co2TaxPerKwh = co2Tax
      ? (expert.co2EmissionsGas * co2Tax.pricePerTon) / 1000
      : 0;

    const gasInflation = Math.pow(1 + expert.gasPriceIncrease / 100, year - 1);

    // Use the correct heating price based on heatingType
    const heatingBasePrice = customer.heatingType === 'gas'
      ? customer.gasPrice / 100
      : customer.oilPrice / 100;

    const gasCosts =
      (heatingBasePrice * gasInflation + co2TaxPerKwh) *
      customer.heatingConsumption;

    // Heat pump costs (electricity for heat pump)
    const electricityInflation = Math.pow(1 + expert.electricityPriceIncrease / 100, year - 1);
    const electricityPrice = (customer.electricityPrice / 100) * electricityInflation;

    // Heat pump uses electricity from grid (part not covered by PV)
    // 🔄 EMS macht intelligente Allokation: Priorisiert WP mit PV-Strom
    let heatPumpSelfConsumption;
    let householdSelfConsumption;

    if (customer.hasEMS) {
      // MIT EMS: WP bekommt max. X% ihres Bedarfs aus PV (einstellbar)
      // Begründung: WP läuft hauptsächlich Winter (wenig PV), auch mit EMS-Optimierung
      // Doppelte Begrenzung für Realismus:

      // Fallback für alte Einstellungen ohne neue Felder
      const wpPvCoverage = expert.emsHeatPumpPvCoverage || 70;
      const maxSelfConsShare = expert.emsMaxSelfConsumptionShare || 75;

      heatPumpSelfConsumption = Math.min(
        heatPumpConsumption * (wpPvCoverage / 100),           // Max X% der WP-Last aus PV
        selfConsumption * (maxSelfConsShare / 100)            // Max Y% des Eigenverbrauchs zur WP
      );

      // Rest geht an Haushalt und E-Auto
      householdSelfConsumption = selfConsumption - heatPumpSelfConsumption;

    } else {
      // OHNE EMS: Proportionale Verteilung - alle Verbraucher gleichberechtigt
      const proportion = selfConsumption / totalElectricityDemand;
      heatPumpSelfConsumption = heatPumpConsumption * proportion;
      householdSelfConsumption = (customer.householdConsumption + eCarConsumption) * proportion;
    }

    const heatPumpGridElectricity = Math.max(
      0,
      heatPumpConsumption - heatPumpSelfConsumption
    );

    const heatPumpCosts = heatPumpGridElectricity * electricityPrice;

    heatingComparison.push({
      year: yearNumber,
      gasCosts: Math.round(gasCosts),
      heatPumpCosts: Math.round(heatPumpCosts),
      savings: Math.round(gasCosts - heatPumpCosts),
    });

    // 🔍 DEBUG: Log first year heating comparison
    if (year === 1 && typeof window !== 'undefined') {
      console.group('🔍 Heating Comparison Year 1');
      console.log('EMS Active:', customer.hasEMS);
      console.log('---');
      console.log('Gas Base Price:', customer.gasPrice, 'ct/kWh');
      console.log('CO2 Tax:', co2TaxPerKwh.toFixed(4), '€/kWh');
      console.log('Gas Costs:', Math.round(gasCosts), '€');
      console.log('---');
      console.log('Heat Pump Consumption:', heatPumpConsumption, 'kWh');
      console.log('Heat Pump from PV:', Math.round(heatPumpSelfConsumption), 'kWh',
        `(${Math.round((heatPumpSelfConsumption / heatPumpConsumption) * 100)}%)`);
      console.log('Heat Pump from Grid:', Math.round(heatPumpGridElectricity), 'kWh');
      console.log('Electricity Price:', Math.round(electricityPrice * 100), 'ct/kWh');
      console.log('Heat Pump Costs:', Math.round(heatPumpCosts), '€');
      console.log('---');
      console.log('Household from PV:', Math.round(householdSelfConsumption), 'kWh');
      console.log('---');
      console.log('Annual Heating Savings:', Math.round(gasCosts - heatPumpCosts), '€');
      console.groupEnd();
    }
  }

  // 8. Additional costs (if enabled)
  const maintenanceCostsPerYear = expert.includeMaintenanceCosts ? 299 : 0;
  const inverterReplacementPerYear = expert.includeInverterReplacement ? 200 : 0;
  const chimneySweepSavings = expert.includeChimneySweep ? 100 : 0; // Kaminkehrer entfällt mit WP
  const additionalCostsPerYear = maintenanceCostsPerYear + inverterReplacementPerYear - chimneySweepSavings;

  // 9. Amortization
  // Average savings per year (considering price increases)
  const averageHeatingsSavings =
    heatingComparison.reduce((sum, y) => sum + y.savings, 0) /
    heatingComparison.length;

  // 9. Calculate amortization and 20-year profit (with degradation if enabled)
  let totalSavings20Years;
  let averageYearlySavings;

  if (expert.includeBatteryDegradation && customer.batterySize > 0) {
    // Calculate with battery degradation (1.5% per year, starting from year 5)
    let yearlySavingsWithDegradation = 0;
    for (let year = 1; year <= 20; year++) {
      // Degradation starts at year 5: 1.5% per year
      const yearsOfDegradation = Math.max(0, year - 5);
      const degradationFactor = Math.pow(1 - 0.015, yearsOfDegradation);
      const adjustedBatteryBoost = batteryBoost * degradationFactor;
      const adjustedAutarky = Math.min(
        expert.baseAutarky + adjustedBatteryBoost + emsBoost,
        85
      );
      const adjustedSelfConsumption = Math.min(
        pvProduction,
        totalElectricityDemand * (adjustedAutarky / 100)
      );
      const adjustedElectricitySavings =
        adjustedSelfConsumption * (customer.electricityPrice / 100);
      const adjustedYearlySavings =
        adjustedElectricitySavings + yearlyFeedInRevenue + averageHeatingsSavings - additionalCostsPerYear;
      yearlySavingsWithDegradation += adjustedYearlySavings;
    }
    totalSavings20Years = yearlySavingsWithDegradation;
    averageYearlySavings = yearlySavingsWithDegradation / 20; // Durchschnitt über 20 Jahre mit Degradation
  } else {
    // Simplified: Assume average savings continue
    averageYearlySavings = yearlyTotalSavings + averageHeatingsSavings - additionalCostsPerYear;
    totalSavings20Years = averageYearlySavings * 20;
  }

  const amortizationYears = customer.totalInvestment / averageYearlySavings;
  const profitAfter20Years = totalSavings20Years - customer.totalInvestment;

  return {
    yearlyElectricitySavings: Math.round(yearlyElectricitySavings),
    yearlyFeedInRevenue: Math.round(yearlyFeedInRevenue),
    emsBonus: Math.round(emsBonus),
    yearlyHeatingSavings: Math.round(averageHeatingsSavings),
    chimneySweepSavings: Math.round(chimneySweepSavings),
    yearlyTotalSavings: Math.round(averageYearlySavings),
    pvProduction: Math.round(pvProduction),
    selfConsumption: Math.round(selfConsumption),
    feedIn: Math.round(feedIn),
    autarkyRate: Math.round(autarkyRate),
    selfConsumptionRate: Math.round(selfConsumptionRate),
    eCarConsumption: Math.round(eCarConsumption),
    heatPumpConsumption: Math.round(heatPumpConsumption),
    totalElectricityDemand: Math.round(totalElectricityDemand),
    gridElectricity: Math.round(gridElectricity),
    heatingComparison,
    amortizationYears: Math.round(amortizationYears * 10) / 10,
    profitAfter20Years: Math.round(profitAfter20Years),
  };
}

// CO₂-Steuer Szenarien
export const co2Scenarios = {
  conservative: [
    { year: 2025, pricePerTon: 55 },
    { year: 2026, pricePerTon: 58 },
    { year: 2027, pricePerTon: 61 },
    { year: 2028, pricePerTon: 64 },
    { year: 2029, pricePerTon: 67 },
    { year: 2030, pricePerTon: 70 },
    { year: 2031, pricePerTon: 73 },
    { year: 2032, pricePerTon: 76 },
    { year: 2033, pricePerTon: 79 },
    { year: 2034, pricePerTon: 82 },
  ],
  moderate: [
    { year: 2025, pricePerTon: 55 },
    { year: 2026, pricePerTon: 60 },
    { year: 2027, pricePerTon: 68 },
    { year: 2028, pricePerTon: 76 },
    { year: 2029, pricePerTon: 84 },
    { year: 2030, pricePerTon: 92 },
    { year: 2031, pricePerTon: 96 },
    { year: 2032, pricePerTon: 100 },
    { year: 2033, pricePerTon: 100 },
    { year: 2034, pricePerTon: 100 },
  ],
  aggressive: [
    { year: 2025, pricePerTon: 55 },
    { year: 2026, pricePerTon: 65 },
    { year: 2027, pricePerTon: 80 },
    { year: 2028, pricePerTon: 95 },
    { year: 2029, pricePerTon: 110 },
    { year: 2030, pricePerTon: 125 },
    { year: 2031, pricePerTon: 135 },
    { year: 2032, pricePerTon: 145 },
    { year: 2033, pricePerTon: 155 },
    { year: 2034, pricePerTon: 165 },
  ],
};

// Hilfsfunktion: Berechnet Heizkosten für ein bestimmtes CO₂-Szenario
export function calculateHeatingScenario(
  customer: CustomerInputs,
  expert: ExpertSettings,
  co2Schedule: { year: number; pricePerTon: number }[],
  years: number = 10
) {
  const comparison = [];

  for (let year = 1; year <= years; year++) {
    const yearNumber = 2025 + (year - 1);

    const co2Tax = co2Schedule.find(s => s.year === yearNumber);
    const co2TaxPerKwh = co2Tax
      ? (expert.co2EmissionsGas * co2Tax.pricePerTon) / 1000
      : 0;

    const gasInflation = Math.pow(1 + expert.gasPriceIncrease / 100, year - 1);
    const gasBasePrice = customer.gasPrice / 100;
    const gasCosts =
      (gasBasePrice * gasInflation + co2TaxPerKwh) *
      customer.heatingConsumption;

    comparison.push({
      year: yearNumber,
      gasCosts: Math.round(gasCosts),
    });
  }

  return comparison;
}

const SETTINGS_VERSION = 2; // Erhöhen bei Breaking Changes

export const defaultExpertSettings: ExpertSettings = {
  version: SETTINGS_VERSION,
  pvYieldPerKwp: 800, // ✅ Realistisch: 800 kWh/kWp (20% weniger als theoretisch)
  heatPumpJAZ: 3.0,
  baseAutarky: 30,
  batteryAutarkyBoost: 18, // ✅ Realistisch mit WP: 15-20% (vorher 25%)
  emsAutarkyBoost: 7.5, // ✅ Konservativ: 5-10% (vorher 12%)
  emsHeatPumpPvCoverage: 70, // ✅ WP bekommt max. 70% ihrer Last aus PV mit EMS
  emsMaxSelfConsumptionShare: 75, // ✅ Max 75% des Eigenverbrauchs kann zur WP gehen
  feedInTariff: 7.86, // ✅ Aktualisiert auf Aug 2025 Teileinspeisung bis 10 kWp
  electricityPriceIncrease: 1.25, // ✅ Korrigiert: BMWK-Prognose (vorher 3%)
  gasPriceIncrease: 2,
  co2TaxSchedule: co2Scenarios.moderate, // ✅ Moderate Szenario (Standard)
  co2EmissionsGas: 0.24, // ✅ Korrigiert: 0.24 kg CO₂/kWh (vorher 0.2)
  includeMaintenanceCosts: true, // Wartungskosten: 299 EUR/Jahr
  includeInverterReplacement: false, // Wechselrichter: 200 EUR/Jahr (3000€ / 15 Jahre)
  includeBatteryDegradation: false, // Speicher-Degradation: 1.5%/Jahr ab Jahr 5
  includeChimneySweep: true, // Kaminkehrer-Kosten entfallen: 100 EUR/Jahr Ersparnis
};

// Migration function: Updates old settings to new defaults
export function migrateSettings(saved: ExpertSettings): ExpertSettings {
  // Version 1 -> Version 2: Update JAZ, battery boost, EMS boost
  if (!saved.version || saved.version < 2) {
    return {
      ...saved,
      version: SETTINGS_VERSION,
      pvYieldPerKwp: 800, // Update auf 800 kWh/kWp (realistisch)
      heatPumpJAZ: 3.0, // Update von 4.0 -> 3.0
      batteryAutarkyBoost: 18, // Update von 25 -> 18
      emsAutarkyBoost: 7.5, // Update von 12 -> 7.5
      includeMaintenanceCosts: saved.includeMaintenanceCosts ?? true,
      includeInverterReplacement: saved.includeInverterReplacement ?? false,
      includeBatteryDegradation: saved.includeBatteryDegradation ?? false,
      includeChimneySweep: saved.includeChimneySweep ?? true,
    };
  }

  return saved;
};
