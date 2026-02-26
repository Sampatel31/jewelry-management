'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';

const statusBadge: any = {
  paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger',
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/billing/invoices', { params: { page, limit: 20 } })
      .then(r => { setInvoices(r.data.invoices); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [page]);

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
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-amber-600">{inv.invoice_number}</td>
                  <td className="py-3 pr-4">{formatDate(inv.invoice_date)}</td>
                  <td className="py-3 pr-4">{inv.customer_name || 'Walk-in'}</td>
                  <td className="py-3 pr-4 font-medium">{formatCurrency(inv.total_amount)}</td>
                  <td className="py-3 pr-4">{formatCurrency(inv.paid_amount)}</td>
                  <td className="py-3 pr-4"><span className={`badge ${statusBadge[inv.payment_status]}`}>{inv.payment_status}</span></td>
                  <td className="py-3 flex gap-2">
                    <Link href={`/billing/${inv.id}`} className="text-xs text-blue-500 hover:underline">View</Link>
                    <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/billing/invoices/${inv.id}/pdf`}
                      target="_blank" className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                      <Download size={14} />
                    </a>
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
