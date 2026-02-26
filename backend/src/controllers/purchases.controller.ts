import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await db('purchase_orders')
      .join('suppliers', 'purchase_orders.supplier_id', 'suppliers.id')
      .select('purchase_orders.*', 'suppliers.name as supplier_name')
      .orderBy('purchase_orders.created_at', 'desc');
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, ...orderData } = req.body;
    const userId = (req as any).user.id;
    const id = uuidv4();
    await db.transaction(async (trx) => {
      await trx('purchase_orders').insert({
        id, ...orderData, created_by: userId, created_at: new Date(), updated_at: new Date(),
      });
      if (items?.length) {
        const itemsData = items.map((item: any) => ({ id: uuidv4(), po_id: id, ...item }));
        await trx('purchase_order_items').insert(itemsData);
      }
    });
    const order = await db('purchase_orders').where({ id }).first();
    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await db('purchase_orders').where({ id: req.params.id }).first();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const items = await db('purchase_order_items').where({ po_id: req.params.id })
      .join('products', 'purchase_order_items.product_id', 'products.id')
      .select('purchase_order_items.*', 'products.name as product_name');
    res.json({ ...order, items });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const receiveGoods = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const userId = (req as any).user.id;
    await db.transaction(async (trx) => {
      await trx('purchase_orders').where({ id: req.params.id })
        .update({ status: 'received', received_date: new Date(), updated_at: new Date() });
      for (const item of items) {
        await trx('purchase_order_items').where({ id: item.id }).update({ received_qty: item.received_qty });
        await trx('products').where({ id: item.product_id }).increment('stock_qty', item.received_qty);
        await trx('inventory_transactions').insert({
          id: uuidv4(), product_id: item.product_id, transaction_type: 'purchase',
          quantity: item.received_qty, reference_id: req.params.id, reference_type: 'purchase_order',
          created_by: userId, created_at: new Date(),
        });
      }
    });
    res.json({ message: 'Goods received' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
