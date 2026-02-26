'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Download, Lock } from 'lucide-react';

const statusBadge: any = {
  paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger',
};

interface NoteForm { reason: string; amount: string; cgst: string; sgst: string; }
const defaultNoteForm: NoteForm = { reason: '', amount: '', cgst: '0', sgst: '0' };

function NoteModal({ title, invoiceId, type, onClose, onSuccess }: {
  title: string; invoiceId: string; type: 'credit-note' | 'debit-note'; onClose: () => void; onSuccess: () => void;
}) {
  const [form, setForm] = useState<NoteForm>(defaultNoteForm);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.reason || !form.amount) return toast.error('Reason and amount are required');
    setSaving(true);
    try {
      await api.post(`/billing/invoices/${invoiceId}/${type}`, {
        reason: form.reason,
        amount: Number(form.amount),
        cgst: Number(form.cgst),
        sgst: Number(form.sgst),
      });
      toast.success(`${title} issued`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to issue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea className="input w-full h-20 resize-none" value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input type="number" className="input w-full" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGST</label>
              <input type="number" className="input w-full" value={form.cgst}
                onChange={e => setForm(f => ({ ...f, cgst: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SGST</label>
              <input type="number" className="input w-full" value={form.sgst}
                onChange={e => setForm(f => ({ ...f, sgst: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Issue'}</button>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [noteModal, setNoteModal] = useState<{ invoiceId: string; type: 'credit-note' | 'debit-note' } | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/billing/invoices', { params: { page, limit: 20 } })
      .then(r => { setInvoices(r.data.invoices); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const finalize = async (id: string) => {
    if (!confirm('Finalize this invoice? It will become immutable.')) return;
    try {
      await api.put(`/billing/invoices/${id}`, { finalization_status: 'finalized' });
      toast.success('Invoice finalized');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to finalize');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing</h1>
        <Link href="/billing/new" className="btn-primary flex items-center gap-2"><Plus size={16} /> New Invoice</Link>
      </div>
      <div className="card">
        {loading ? <div className="h-64 animate-pulse bg-gray-100 rounded" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-3 pr-4">Invoice #</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Paid</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const isFinalized = inv.finalization_status === 'finalized';
                return (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-amber-600">
                      {inv.invoice_number}
                      {isFinalized && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                          <Lock size={10} /> FINALIZED
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">{formatDate(inv.invoice_date)}</td>
                    <td className="py-3 pr-4">{inv.customer_name || 'Walk-in'}</td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(inv.total_amount)}</td>
                    <td className="py-3 pr-4">{formatCurrency(inv.paid_amount)}</td>
                    <td className="py-3 pr-4"><span className={`badge ${statusBadge[inv.payment_status]}`}>{inv.payment_status}</span></td>
                    <td className="py-3 flex flex-wrap gap-2">
                      <Link href={`/billing/${inv.id}`} className="text-xs text-blue-500 hover:underline">View</Link>
                      {!isFinalized && (
                        <>
                          <Link href={`/billing/${inv.id}`} className="text-xs text-gray-500 hover:underline">Edit</Link>
                          <button onClick={() => finalize(inv.id)} className="text-xs text-green-600 hover:underline">Finalize</button>
                        </>
                      )}
                      {isFinalized && (
                        <>
                          <button onClick={() => setNoteModal({ invoiceId: inv.id, type: 'credit-note' })} className="text-xs text-blue-600 hover:underline">Credit Note</button>
                          <button onClick={() => setNoteModal({ invoiceId: inv.id, type: 'debit-note' })} className="text-xs text-orange-600 hover:underline">Debit Note</button>
                        </>
                      )}
                      <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/billing/invoices/${inv.id}/pdf`}
                        target="_blank" className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                        <Download size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Total: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
            <span className="px-3 py-1">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
      {noteModal && (
        <NoteModal
          title={noteModal.type === 'credit-note' ? 'Issue Credit Note' : 'Issue Debit Note'}
          invoiceId={noteModal.invoiceId}
          type={noteModal.type}
          onClose={() => setNoteModal(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
