import PDFDocument from 'pdfkit';
import { Response } from 'express';

const DEFAULT_GST_RATE = 1.5;

export const generateInvoicePDF = (invoice: any, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
  doc.moveDown();

  // Store info
  doc.fontSize(14).text(invoice.store_name || 'JewelMS Jewelry Store');
  doc.fontSize(10).text(invoice.store_address || '123 Gold Street, Mumbai');
  doc.text(`GST: ${invoice.store_gst || '27AABCU9603R1ZX'}`);
  doc.text(`Phone: ${invoice.store_phone || '+91 98765 43210'}`);
  doc.moveDown();

  // Invoice info
  doc.fontSize(12).text(`Invoice Number: ${invoice.invoice_number}`);
  doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN')}`);
  doc.moveDown();

  // Customer info
  if (invoice.customer_name) {
    doc.text(`Customer: ${invoice.customer_name}`);
    if (invoice.customer_phone) doc.text(`Phone: ${invoice.customer_phone}`);
    if (invoice.customer_gst) doc.text(`GSTIN: ${invoice.customer_gst}`);
  }
  doc.moveDown();

  // Items table
  doc.fontSize(10);
  const tableTop = doc.y;

  doc.text('Product', 50, tableTop, { width: 150 });
  doc.text('HSN', 200, tableTop, { width: 60 });
  doc.text('Qty', 260, tableTop, { width: 40 });
  doc.text('Rate', 300, tableTop, { width: 60 });
  doc.text('Making', 360, tableTop, { width: 60 });
  doc.text('GST', 420, tableTop, { width: 60 });
  doc.text('Total', 480, tableTop, { width: 60 });

  doc.moveTo(50, doc.y + 2).lineTo(560, doc.y + 2).stroke();
  doc.moveDown();

  let y = doc.y;
  for (const item of (invoice.items || [])) {
    const subtotal = (item.unit_price + item.making_charges + (item.stone_charges || 0)) * item.quantity - (item.discount || 0);
    const cgst = subtotal * (item.cgst_rate || DEFAULT_GST_RATE) / 100;
    const sgst = subtotal * (item.sgst_rate || DEFAULT_GST_RATE) / 100;
    const total = subtotal + cgst + sgst;

    doc.text(item.product_name, 50, y, { width: 150 });
    doc.text(item.hsn_code || '', 200, y, { width: 60 });
    doc.text(String(item.quantity), 260, y, { width: 40 });
    doc.text(`₹${Number(item.unit_price).toFixed(2)}`, 300, y, { width: 60 });
    doc.text(`₹${Number(item.making_charges).toFixed(2)}`, 360, y, { width: 60 });
    doc.text(`₹${(cgst + sgst).toFixed(2)}`, 420, y, { width: 60 });
    doc.text(`₹${total.toFixed(2)}`, 480, y, { width: 60 });
    y += 20;
    doc.y = y;
  }

  doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
  doc.moveDown();

  // Totals
  doc.text(`Subtotal: ₹${Number(invoice.subtotal).toFixed(2)}`, { align: 'right' });
  if (invoice.discount_amount > 0) {
    doc.text(`Discount: -₹${Number(invoice.discount_amount).toFixed(2)}`, { align: 'right' });
  }
  doc.text(`CGST: ₹${Number(invoice.cgst_amount).toFixed(2)}`, { align: 'right' });
  doc.text(`SGST: ₹${Number(invoice.sgst_amount).toFixed(2)}`, { align: 'right' });
  doc.fontSize(14).text(`Total: ₹${Number(invoice.total_amount).toFixed(2)}`, { align: 'right' });
  doc.fontSize(10).text(`Payment Mode: ${invoice.payment_mode || 'cash'}`, { align: 'right' });
  doc.text(`Amount Paid: ₹${Number(invoice.paid_amount || 0).toFixed(2)}`, { align: 'right' });

  doc.end();
};
