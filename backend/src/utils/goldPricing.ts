/**
 * Gold / Metal Pricing Engine
 * Handles purity conversion, wastage, making charges, and stone pricing.
 */

// Purity multipliers relative to 24K (pure gold)
export const GOLD_PURITY_MULTIPLIERS: Record<string, number> = {
  '24k': 1,
  '22k': 22 / 24,
  '18k': 18 / 24,
  '14k': 14 / 24,
};

// GST rates by HSN code
export const HSN_GST_RATES: Record<string, number> = {
  '7113': 3,  // Gold/silver jewelry
  '7114': 3,  // Gold/silver articles of goldsmiths
  '7116': 3,  // Precious/semi-precious stone articles
  '7117': 5,  // Imitation jewelry
};

export const DEFAULT_GST_RATE = 3;

/**
 * Convert 24K rate to a specific purity rate.
 */
export function getPurityRate(rate24k: number, purity: string): number {
  const key = purity.toLowerCase();
  const multiplier = GOLD_PURITY_MULTIPLIERS[key] ?? 1;
  return rate24k * multiplier;
}

/**
 * Calculate making charges for a product.
 * @param type 'flat' | 'per_gram'
 * @param flatAmount flat making charge per piece
 * @param perGramRate making charge per gram
 * @param weightGm metal weight in grams
 */
export function calculateMakingCharges(
  type: 'flat' | 'per_gram',
  flatAmount: number,
  perGramRate: number,
  weightGm: number,
): number {
  if (type === 'per_gram') return perGramRate * weightGm;
  return flatAmount;
}

/**
 * Calculate wastage amount added to making charges.
 * @param basePrice metal value (rate * weight)
 * @param wastage_pct wastage percentage (e.g. 2.5 for 2.5%)
 */
export function calculateWastage(basePrice: number, wastage_pct: number): number {
  return (basePrice * wastage_pct) / 100;
}

/**
 * Calculate stone/diamond price.
 * @param weightCt weight in carats
 * @param pricePerCarat price per carat
 */
export function calculateStonePrice(weightCt: number, pricePerCarat: number): number {
  return weightCt * pricePerCarat;
}

/**
 * Calculate old gold exchange value.
 * @param weightGm weight in grams
 * @param purity purity string (e.g. '22k')
 * @param rate24k current 24K gold rate per gram
 */
export function calculateOldGoldValue(weightGm: number, purity: string, rate24k: number): number {
  const rate = getPurityRate(rate24k, purity);
  return weightGm * rate;
}

/**
 * Get GST rate (%) based on HSN code. Defaults to 3%.
 */
export function getGstRateForHsn(hsnCode: string): number {
  return HSN_GST_RATES[hsnCode] ?? DEFAULT_GST_RATE;
}

/**
 * Generate a financial-year-based invoice number.
 * Example: INV/2025-26/00001
 * @param prefix e.g. 'INV'
 * @param serial sequential integer
 * @param startMonth month (1-based) when financial year starts (default: 4 for April)
 */
export function generateFinancialYearInvoiceNumber(
  prefix: string,
  serial: number,
  startMonth: number = 4,
): { invoiceNumber: string; financialYear: string } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  let fyStart = year;
  if (month < startMonth) fyStart = year - 1;
  const fyEnd = (fyStart + 1).toString().slice(2); // last 2 digits
  const financialYear = `${fyStart}-${fyEnd}`;

  const serialPadded = String(serial).padStart(5, '0');
  const invoiceNumber = `${prefix}/${financialYear}/${serialPadded}`;
  return { invoiceNumber, financialYear };
}
