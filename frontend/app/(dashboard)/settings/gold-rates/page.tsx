'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, Plus } from 'lucide-react';

const METALS = ['gold', 'silver', 'platinum'];
const PURITIES: Record<string, string[]> = {
  gold: ['24k', '22k', '18k', '14k'],
  silver: ['999', '925', '800'],
  platinum: ['950', '900'],
};

export default function GoldRatesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    metal_type: 'gold',
    purity: '22k',
    rate_per_gram: '',
    effective_date: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['metal-rates'],
    queryFn: () => api.get('/settings/metal-rates').then((r) => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (payload: any) => api.post('/settings/metal-rates', payload),
    onSuccess: () => {
      toast.success('Rate added!');
      qc.invalidateQueries({ queryKey: ['metal-rates'] });
      setForm((f) => ({ ...f, rate_per_gram: '' }));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const handleMetalChange = (metal: string) => {
    const defaultPurity = PURITIES[metal]?.[0] ?? '';
    setForm((f) => ({ ...f, metal_type: metal, purity: defaultPurity }));
  };

  const rates: any[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="text-amber-500" />
        <h1 className="text-2xl font-bold">Daily Metal Rates</h1>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Plus size={16} /> Add Today&apos;s Rate</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Metal</label>
            <select
              value={form.metal_type}
              onChange={(e) => handleMetalChange(e.target.value)}
              className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {METALS.map((m) => <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Purity</label>
            <select
              value={form.purity}
              onChange={(e) => setForm((f) => ({ ...f, purity: e.target.value }))}
              className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {(PURITIES[form.metal_type] ?? []).map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Rate / gram (₹)</label>
            <input
              type="number" step="0.01" min="0"
              value={form.rate_per_gram}
              onChange={(e) => setForm((f) => ({ ...f, rate_per_gram: e.target.value }))}
              className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="e.g. 7200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={form.effective_date}
              onChange={(e) => setForm((f) => ({ ...f, effective_date: e.target.value }))}
              className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        <button
          onClick={() => addMutation.mutate(form)}
          disabled={!form.rate_per_gram || addMutation.isPending}
          className="btn-primary"
        >
          {addMutation.isPending ? 'Adding…' : 'Add Rate'}
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Rate History</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-2 pr-4">Metal</th>
                <th className="pb-2 pr-4">Purity</th>
                <th className="pb-2 pr-4">Rate / gram</th>
                <th className="pb-2">Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No rates entered yet</td></tr>
              )}
              {rates.slice(0, 50).map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 capitalize">{r.metal_type}</td>
                  <td className="py-2 pr-4 uppercase">{r.purity}</td>
                  <td className="py-2 pr-4 font-semibold">₹{Number(r.rate_per_gram).toLocaleString('en-IN')}</td>
                  <td className="py-2 text-gray-500">{r.effective_date?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
