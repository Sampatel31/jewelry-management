'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Coins, Plus, RefreshCw } from 'lucide-react';

const PURITIES = ['24k', '22k', '18k', '14k'];
const PURITY_MULTIPLIERS: Record<string, number> = { '24k': 1, '22k': 22 / 24, '18k': 18 / 24, '14k': 14 / 24 };

export default function OldGoldPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer_id: '',
    metal_type: 'gold',
    purity: '22k',
    weight_gm: '',
    rate_per_gram: '',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['old-gold'],
    queryFn: () => api.get('/old-gold').then((r) => r.data),
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => api.get('/customers?limit=200').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/old-gold', payload),
    onSuccess: () => {
      toast.success('Old gold transaction recorded');
      qc.invalidateQueries({ queryKey: ['old-gold'] });
      setShowForm(false);
      setForm({ customer_id: '', metal_type: 'gold', purity: '22k', weight_gm: '', rate_per_gram: '', notes: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const computedValue =
    form.weight_gm && form.rate_per_gram
      ? (
          Number(form.weight_gm) *
          Number(form.rate_per_gram) *
          (PURITY_MULTIPLIERS[form.purity] ?? 1)
        ).toFixed(2)
      : '—';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const transactions = data?.transactions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="text-amber-500" />
          <h1 className="text-2xl font-bold">Old Gold Exchange</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Exchange
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-semibold text-lg">Record Old Gold</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                value={form.customer_id}
                onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Walk-in customer</option>
                {customersData?.customers?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Metal Type</label>
              <select
                value={form.metal_type}
                onChange={(e) => setForm((f) => ({ ...f, metal_type: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purity</label>
              <select
                value={form.purity}
                onChange={(e) => setForm((f) => ({ ...f, purity: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {PURITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (grams)</label>
              <input
                type="number" step="0.001" min="0"
                value={form.weight_gm}
                onChange={(e) => setForm((f) => ({ ...f, weight_gm: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">24K Rate / gram (₹)</label>
              <input
                type="number" step="0.01" min="0"
                value={form.rate_per_gram}
                onChange={(e) => setForm((f) => ({ ...f, rate_per_gram: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
            <span className="text-sm text-gray-600">Estimated Exchange Value:</span>
            <span className="font-bold text-amber-600 text-lg">₹{computedValue}</span>
            <span className="text-xs text-gray-400">(at {form.purity.toUpperCase()} purity)</span>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Saving…' : 'Record Exchange'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Exchanges</h2>
          <button onClick={() => qc.invalidateQueries({ queryKey: ['old-gold'] })} className="text-gray-400 hover:text-amber-500">
            <RefreshCw size={16} />
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Metal</th>
                <th className="pb-2 pr-4">Purity</th>
                <th className="pb-2 pr-4">Weight (g)</th>
                <th className="pb-2 pr-4">Rate/g</th>
                <th className="pb-2 pr-4">Exchange Value</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No transactions yet</td></tr>
              )}
              {transactions.map((t: any) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4">{t.customer_name || 'Walk-in'}</td>
                  <td className="py-2 pr-4 capitalize">{t.metal_type}</td>
                  <td className="py-2 pr-4 uppercase">{t.purity}</td>
                  <td className="py-2 pr-4">{t.weight_gm}g</td>
                  <td className="py-2 pr-4">₹{t.rate_per_gram}</td>
                  <td className="py-2 pr-4 font-semibold text-amber-600">₹{Number(t.exchange_value).toLocaleString('en-IN')}</td>
                  <td className="py-2 text-gray-400">{t.created_at?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
