'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewRepairPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({ customer_id: '', item_description: '', issue_description: '', received_date: new Date().toISOString().split('T')[0], estimated_cost: 0, advance_paid: 0, expected_date: '', notes: '' });

  useEffect(() => { api.get('/customers', { params: { limit: 100 } }).then(r => setCustomers(r.data.customers)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/repairs', form);
      toast.success('Repair job created!');
      router.push('/repairs');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Repair Job</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Description *</label>
          <input value={form.item_description} onChange={e => setForm(p => ({ ...p, item_description: e.target.value }))} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description *</label>
          <textarea value={form.issue_description} onChange={e => setForm(p => ({ ...p, issue_description: e.target.value }))} required rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
            <input type="date" value={form.received_date} onChange={e => setForm(p => ({ ...p, received_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
            <input type="date" value={form.expected_date} onChange={e => setForm(p => ({ ...p, expected_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Cost</label>
            <input type="number" value={form.estimated_cost} onChange={e => setForm(p => ({ ...p, estimated_cost: parseFloat(e.target.value) || 0 }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create Repair Job</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
