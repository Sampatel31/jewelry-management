import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { calculateInvoiceTotals } from '../utils/gst';

export const completeSale = async (req: Request, res: Response) => {
  try {
    const { items, customer_id, payment_mode, paid_amount, discount_amount = 0 } = req.body;
    const userId = (req as any).user.id;
    const id = uuidv4();
    const count = await db('invoices').count('* as c').first();
    const invoiceNumber = `INV-${String(Number(count?.c || 0) + 1).padStart(6, '0')}`;
    const totals = calculateInvoiceTotals(items, discount_amount);

    await db.transaction(async (trx) => {
      const paymentStatus = Number(paid_amount) >= totals.total_amount ? 'paid' : Number(paid_amount) > 0 ? 'partial' : 'unpaid';
      await trx('invoices').insert({
        id, invoice_number: invoiceNumber, customer_id: customer_id || null,
        invoice_date: new Date(), ...totals, discount_amount,
        paid_amount: paid_amount || 0, payment_status: paymentStatus, payment_mode,
        created_by: userId, created_at: new Date(), updated_at: new Date(),
      });

      for (const item of items) {
        await trx('invoice_items').insert({ id: uuidv4(), invoice_id: id, ...item });
        await trx('products').where({ id: item.product_id }).decrement('stock_qty', item.quantity);
        await trx('inventory_transactions').insert({
          id: uuidv4(), product_id: item.product_id, transaction_type: 'sale',
          quantity: -item.quantity, reference_id: id, reference_type: 'invoice',
          created_by: userId, created_at: new Date(),
        });
      }

      if (customer_id && paid_amount > 0) {
        await trx('payments').insert({
          id: uuidv4(), invoice_id: id, amount: paid_amount, payment_mode,
          payment_date: new Date(), created_at: new Date(),
        });
        await trx('customers').where({ id: customer_id })
          .increment('total_purchases', totals.total_amount)
          .increment('loyalty_points', Math.floor(totals.total_amount / 1000));
      }
    });

    res.status(201).json({ invoice_id: id, invoice_number: invoiceNumber, ...totals });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const products = await db('products')
      .where('is_active', true)
      .where(function() {
        this.where('name', 'ilike', `%${q}%`).orWhere('barcode', 'ilike', `%${q}%`).orWhere('sku', 'ilike', `%${q}%`);
      })
      .select('*').limit(20);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
