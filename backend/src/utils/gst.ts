export interface InvoiceItem {
  unit_price: number;
  making_charges: number;
  stone_charges: number;
  quantity: number;
  discount: number;
  cgst_rate: number;
  sgst_rate: number;
}

export const calculateItemTotal = (item: InvoiceItem) => {
  const subtotal = (item.unit_price + item.making_charges + item.stone_charges) * item.quantity - item.discount;
  const cgst = subtotal * item.cgst_rate / 100;
  const sgst = subtotal * item.sgst_rate / 100;
  const total = subtotal + cgst + sgst;
  return { subtotal, cgst, sgst, total };
};

export const calculateInvoiceTotals = (items: InvoiceItem[], invoiceDiscount: number = 0) => {
  let subtotal = 0, cgstTotal = 0, sgstTotal = 0;
  for (const item of items) {
    const { subtotal: s, cgst, sgst } = calculateItemTotal(item);
    subtotal += s;
    cgstTotal += cgst;
    sgstTotal += sgst;
  }
  const total = subtotal + cgstTotal + sgstTotal - invoiceDiscount;
  return { subtotal, cgst_amount: cgstTotal, sgst_amount: sgstTotal, total_amount: total };
};
