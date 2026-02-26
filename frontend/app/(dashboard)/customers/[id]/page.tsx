'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    Promise.all([
      api.get(`/customers/${id}`),
      api.get(`/customers/${id}/invoices`),
      api.get(`/customers/${id}/repairs`),
    ]).then(([c, inv, rep]) => {
      setCustomer(c.data);
      setForm(c.data);
      setInvoices(inv.data);
      setRepairs(rep.data);
    });
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/customers/${id}`, form);
      toast.success('Customer updated!');
      setCustomer(form);
      setEditing(false);
    } catch { toast.error('Failed to update'); }
  };

  if (!customer) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <div className="ml-auto flex gap-2">
          {editing ? (
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm"><Save size={16} /> Save</button>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card col-span-2">
          <h3 className="font-semibold mb-3">Customer Info</h3>
          {editing ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([k, l]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                  <input value={form[k] || ''} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Phone:</span> {customer.phone}</div>
              <div><span className="text-gray-500">Email:</span> {customer.email || '-'}</div>
              <div><span className="text-gray-500">City:</span> {customer.city || '-'}</div>
              <div><span className="text-gray-500">State:</span> {customer.state || '-'}</div>
              <div><span className="text-gray-500">GST:</span> {customer.gst_number || '-'}</div>
              <div><span className="text-gray-500">Birthday:</span> {customer.birthday ? formatDate(customer.birthday) : '-'}</div>
            </div>
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Loyalty & Stats</h3>
          <div className="space-y-3">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{customer.loyalty_points}</div>
              <div className="text-xs text-gray-500">Loyalty Points</div>
            </div>
            <div className="text-sm">
              <div className="text-gray-500">Total Purchases</div>
              <div className="font-semibold text-lg">{formatCurrency(customer.total_purchases)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-3">Purchase History ({invoices.length})</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-500 text-left font-medium"><th className="pb-2 pr-4">Invoice #</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Amount</th><th className="pb-2">Status</th></tr></thead>
          <tbody>
            {invoices.slice(0, 10).map((inv: any) => (
              <tr key={inv.id} className="border-b"><td className="py-2 pr-4 font-mono text-xs text-amber-600">{inv.invoice_number}</td><td className="py-2 pr-4">{formatDate(inv.invoice_date)}</td><td className="py-2 pr-4">{formatCurrency(inv.total_amount)}</td><td className="py-2"><span className={`badge ${inv.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{inv.payment_status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {repairs.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Repair History ({repairs.length})</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500 text-left font-medium"><th className="pb-2 pr-4">Repair #</th><th className="pb-2 pr-4">Item</th><th className="pb-2 pr-4">Date</th><th className="pb-2">Status</th></tr></thead>
            <tbody>
              {repairs.map((r: any) => (
                <tr key={r.id} className="border-b"><td className="py-2 pr-4 font-mono text-xs text-amber-600">{r.repair_number}</td><td className="py-2 pr-4">{r.item_description}</td><td className="py-2 pr-4">{formatDate(r.received_date)}</td><td className="py-2"><span className="badge badge-info">{r.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
