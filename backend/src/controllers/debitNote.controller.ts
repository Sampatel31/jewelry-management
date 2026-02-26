import { Request, Response } from 'express';
import db from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { auditLog } from '../utils/audit';

const FINALIZED = 'finalized';

export const createDebitNote = async (req: Request, res: Response) => {
  try {
    const invoice = await db('invoices').where({ id: req.params.id }).first();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.finalization_status !== FINALIZED) {
      return res.status(400).json({ message: 'Debit notes can only be issued against a finalized invoice' });
    }
    const userId = (req as any).user.id;
    const id = uuidv4();
    const { reason, amount, cgst = 0, sgst = 0 } = req.body;
    await db('debit_notes').insert({
      id, invoice_id: req.params.id, reason, amount, cgst, sgst, issued_by: userId, created_at: new Date(),
    });
    const note = await db('debit_notes').where({ id }).first();
    await auditLog({ userId, action: 'CREATE', tableName: 'debit_notes', recordId: id, newValues: note, ipAddress: req.ip });
    res.status(201).json(note);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getDebitNotes = async (req: Request, res: Response) => {
  try {
    const notes = await db('debit_notes')
      .where({ invoice_id: req.params.id })
      .join('users', 'debit_notes.issued_by', 'users.id')
      .select('debit_notes.*', 'users.name as issued_by_name')
      .orderBy('debit_notes.created_at', 'desc');
    res.json(notes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
