import { getGstRateForHsn } from './goldPricing';

export interface InvoiceItem {
  unit_price: number;
  making_charges: number;
  stone_charges: number;
  quantity: number;
  discount: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate?: number;
  hsn_code?: string;
  wastage_pct?: number;
}

export const calculateItemTotal = (item: InvoiceItem) => {
  const wastageAmount = item.wastage_pct
    ? (item.unit_price * (item.wastage_pct / 100))
    : 0;
  const subtotal =
    (item.unit_price + item.making_charges + item.stone_charges + wastageAmount) *
      item.quantity -
    item.discount;

  // Support IGST (interstate) or CGST+SGST (intrastate)
  const igst_rate = item.igst_rate ?? 0;
  if (igst_rate > 0) {
    const igst = subtotal * igst_rate / 100;
    const total = subtotal + igst;
    return { subtotal, cgst: 0, sgst: 0, igst, total };
  }

  const cgst = subtotal * item.cgst_rate / 100;
  const sgst = subtotal * item.sgst_rate / 100;
  const total = subtotal + cgst + sgst;
  return { subtotal, cgst, sgst, igst: 0, total };
};

export const calculateInvoiceTotals = (items: InvoiceItem[], invoiceDiscount: number = 0) => {
  let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;
  for (const item of items) {
    const { subtotal: s, cgst, sgst, igst } = calculateItemTotal(item);
    subtotal += s;
    cgstTotal += cgst;
    sgstTotal += sgst;
    igstTotal += igst;
  }
  const total = subtotal + cgstTotal + sgstTotal + igstTotal - invoiceDiscount;
  return {
    subtotal,
    cgst_amount: cgstTotal,
    sgst_amount: sgstTotal,
    igst_amount: igstTotal,
    total_amount: total,
  };
};

/**
 * Get default GST rates for a product based on its HSN code.
 * Returns CGST + SGST (half each) or full IGST rate.
 */
export const getDefaultGstRates = (hsnCode: string, isInterstate: boolean = false) => {
  const totalRate = getGstRateForHsn(hsnCode);
  if (isInterstate) {
    return { cgst_rate: 0, sgst_rate: 0, igst_rate: totalRate };
  }
  const half = totalRate / 2;
  return { cgst_rate: half, sgst_rate: half, igst_rate: 0 };
};

