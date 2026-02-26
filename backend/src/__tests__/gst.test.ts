import { calculateItemTotal, calculateInvoiceTotals, InvoiceItem } from '../utils/gst';

describe('calculateItemTotal', () => {
  const baseItem: InvoiceItem = {
    unit_price: 10000,
    making_charges: 500,
    stone_charges: 200,
    quantity: 1,
    discount: 0,
    cgst_rate: 1.5,
    sgst_rate: 1.5,
  };

  it('calculates intrastate CGST+SGST correctly', () => {
    const result = calculateItemTotal(baseItem);
    expect(result.subtotal).toBe(10700);
    expect(result.cgst).toBeCloseTo(160.5);
    expect(result.sgst).toBeCloseTo(160.5);
    expect(result.igst).toBe(0);
    expect(result.total).toBeCloseTo(11021);
  });

  it('calculates interstate IGST correctly', () => {
    const item: InvoiceItem = { ...baseItem, cgst_rate: 0, sgst_rate: 0, igst_rate: 3 };
    const result = calculateItemTotal(item);
    expect(result.subtotal).toBe(10700);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBeCloseTo(321);
    expect(result.total).toBeCloseTo(11021);
  });

  it('applies discount before tax', () => {
    const item: InvoiceItem = { ...baseItem, discount: 200 };
    const result = calculateItemTotal(item);
    expect(result.subtotal).toBe(10500);
    expect(result.cgst).toBeCloseTo(157.5);
    expect(result.sgst).toBeCloseTo(157.5);
    expect(result.total).toBeCloseTo(10815);
  });

  it('applies wastage percentage', () => {
    const item: InvoiceItem = { ...baseItem, wastage_pct: 10 };
    // wastageAmount = 10000 * 10/100 = 1000
    // subtotal = (10000 + 500 + 200 + 1000) * 1 - 0 = 11700
    const result = calculateItemTotal(item);
    expect(result.subtotal).toBe(11700);
    expect(result.cgst).toBeCloseTo(175.5);
    expect(result.sgst).toBeCloseTo(175.5);
    expect(result.total).toBeCloseTo(12051);
  });
});

describe('calculateInvoiceTotals', () => {
  it('sums totals for multiple items', () => {
    const items: InvoiceItem[] = [
      {
        unit_price: 5000,
        making_charges: 0,
        stone_charges: 0,
        quantity: 2,
        discount: 0,
        cgst_rate: 1.5,
        sgst_rate: 1.5,
      },
      {
        unit_price: 2000,
        making_charges: 100,
        stone_charges: 0,
        quantity: 1,
        discount: 0,
        cgst_rate: 1.5,
        sgst_rate: 1.5,
      },
    ];
    const result = calculateInvoiceTotals(items);
    // item1: subtotal=10000, cgst=150, sgst=150, total=10300
    // item2: subtotal=2100, cgst=31.5, sgst=31.5, total=2163
    expect(result.subtotal).toBeCloseTo(12100);
    expect(result.cgst_amount).toBeCloseTo(181.5);
    expect(result.sgst_amount).toBeCloseTo(181.5);
    expect(result.igst_amount).toBe(0);
    expect(result.total_amount).toBeCloseTo(12463);
  });

  it('applies invoice-level discount', () => {
    const items: InvoiceItem[] = [
      {
        unit_price: 10000,
        making_charges: 0,
        stone_charges: 0,
        quantity: 1,
        discount: 0,
        cgst_rate: 1.5,
        sgst_rate: 1.5,
      },
    ];
    const result = calculateInvoiceTotals(items, 500);
    expect(result.total_amount).toBeCloseTo(9800);
  });
});
