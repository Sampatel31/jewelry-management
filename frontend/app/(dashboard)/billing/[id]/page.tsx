'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Download, ArrowLeft } from 'lucide-react';

const statusBadge: any = {
  paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger',
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payment, setPayment] = useState({ amount: 0, payment_mode: 'cash', payment_date: new Date().toISOString().split('T')[0], reference_number: '' });

  const fetchInvoice = () => {
    api.get(`/billing/invoices/${id}`).then(r => setInvoice(r.data));
  };

  useEffect(() => { fetchInvoice(); }, [id]);

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/billing/invoices/${id}/payment`, payment);
      toast.success('Payment recorded!');
      setShowPayment(false);
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (!invoice) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-bold">Invoice {invoice.invoice_number}</h1>
        <span className={`badge ${statusBadge[invoice.payment_status]}`}>{invoice.payment_status}</span>
        <div className="ml-auto flex gap-2">
          <a href={`${apiUrl}/billing/invoices/${id}/pdf`} target="_blank"
            className="btn-secondary flex items-center gap-2 text-sm"><Download size={16} /> Download PDF</a>
          {invoice.payment_status !== 'paid' && (
            <button onClick={() => setShowPayment(true)} className="btn-primary text-sm">Record Payment</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Invoice Details</h3>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Date:</span> {formatDate(invoice.invoice_date)}</div>
            <div><span className="text-gray-500">Customer:</span> {invoice.customer_name || 'Walk-in'}</div>
            <div><span className="text-gray-500">Phone:</span> {invoice.customer_phone || '-'}</div>
            <div><span className="text-gray-500">Payment Mode:</span> {invoice.payment_mode}</div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Amount Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">CGST</span><span>{formatCurrency(invoice.cgst_amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">SGST</span><span>{formatCurrency(invoice.sgst_amount)}</span></div>
            {invoice.discount_amount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-{formatCurrency(invoice.discount_amount)}</span></div>}
            <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span className="text-amber-600">{formatCurrency(invoice.total_amount)}</span></div>
            <div className="flex justify-between text-green-600"><span>Paid</span><span>{formatCurrency(invoice.paid_amount)}</span></div>
            <div className="flex justify-between text-red-500"><span>Balance</span><span>{formatCurrency(Number(invoice.total_amount) - Number(invoice.paid_amount))}</span></div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-3">Items</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 font-medium">
              <th className="pb-2 pr-4">Product</th>
              <th className="pb-2 pr-4">HSN</th>
              <th className="pb-2 pr-4">Qty</th>
              <th className="pb-2 pr-4">Rate</th>
              <th className="pb-2 pr-4">Making</th>
              <th className="pb-2 pr-4">GST</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item: any) => {
              const base = (Number(item.unit_price) + Number(item.making_charges) + Number(item.stone_charges)) * item.quantity - Number(item.discount);
              const gst = base * (Number(item.cgst_rate) + Number(item.sgst_rate)) / 100;
              return (
                <tr key={item.id} className="border-b">
                  <td className="py-2 pr-4 font-medium">{item.product_name}</td>
                  <td className="py-2 pr-4 text-gray-500">{item.hsn_code}</td>
                  <td className="py-2 pr-4">{item.quantity}</td>
                  <td className="py-2 pr-4">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 pr-4">{formatCurrency(item.making_charges)}</td>
                  <td className="py-2 pr-4">{formatCurrency(gst)}</td>
                  <td className="py-2 font-semibold text-right">{formatCurrency(item.total_price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {invoice.payments?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Payment History</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500 text-left font-medium"><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Mode</th><th className="pb-2 pr-4">Reference</th><th className="pb-2 text-right">Amount</th></tr></thead>
            <tbody>
              {invoice.payments.map((p: any) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 pr-4">{formatDate(p.payment_date)}</td>
                  <td className="py-2 pr-4 capitalize">{p.payment_mode}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.reference_number || '-'}</td>
                  <td className="py-2 font-semibold text-right text-green-600">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
            <form onSubmit={recordPayment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select value={payment.payment_mode} onChange={e => setPayment(p => ({ ...p, payment_mode: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {['cash', 'card', 'upi', 'cheque', 'emi'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={payment.payment_date} onChange={e => setPayment(p => ({ ...p, payment_date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
                <input value={payment.reference_number} onChange={e => setPayment(p => ({ ...p, reference_number: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Record</button>
                <button type="button" onClick={() => setShowPayment(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
