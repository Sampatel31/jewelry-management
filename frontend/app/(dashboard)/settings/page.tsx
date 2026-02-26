'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [metalRates, setMetalRates] = useState<any[]>([]);
  const [newRate, setNewRate] = useState({ metal_type: 'gold', purity: '22k', rate_per_gram: 0, effective_date: new Date().toISOString().split('T')[0] });
  const [tab, setTab] = useState('store');

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data));
    api.get('/settings/metal-rates').then(r => setMetalRates(r.data));
  }, []);

  const saveSettings = async () => {
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
  };

  const addMetalRate = async () => {
    try {
      const { data } = await api.post('/settings/metal-rates', newRate);
      setMetalRates(r => [data, ...r]);
      toast.success('Rate added!');
    } catch { toast.error('Failed to add rate'); }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex gap-2 border-b pb-2">
        {[['store', 'Store Info'], ['tax', 'Tax Config'], ['metal', 'Metal Rates']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t ${tab === key ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'store' && (
        <div className="card space-y-4">
          {[['store_name', 'Store Name'], ['store_address', 'Address'], ['store_gst', 'GST Number'], ['store_phone', 'Phone'], ['store_email', 'Email']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input value={settings[key] || ''} onChange={e => setSettings((s: any) => ({ ...s, [key]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          ))}
          <button onClick={saveSettings} className="btn-primary">Save Store Info</button>
        </div>
      )}

      {tab === 'tax' && (
        <div className="card space-y-4">
          {[['default_cgst_rate', 'Default CGST Rate (%)'], ['default_sgst_rate', 'Default SGST Rate (%)']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="number" value={settings[key] || ''} onChange={e => setSettings((s: any) => ({ ...s, [key]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          ))}
          <button onClick={saveSettings} className="btn-primary">Save Tax Config</button>
        </div>
      )}

      {tab === 'metal' && (
        <div className="card space-y-4">
          <h2 className="font-semibold">Add Metal Rate</h2>
          <div className="grid grid-cols-4 gap-3">
            <select value={newRate.metal_type} onChange={e => setNewRate(r => ({ ...r, metal_type: e.target.value }))}
              className="border rounded-lg px-2 py-2 text-sm focus:outline-none">
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
            </select>
            <input placeholder="Purity (e.g. 22k)" value={newRate.purity} onChange={e => setNewRate(r => ({ ...r, purity: e.target.value }))}
              className="border rounded-lg px-2 py-2 text-sm focus:outline-none" />
            <input type="number" placeholder="Rate/gram" value={newRate.rate_per_gram} onChange={e => setNewRate(r => ({ ...r, rate_per_gram: parseFloat(e.target.value) || 0 }))}
              className="border rounded-lg px-2 py-2 text-sm focus:outline-none" />
            <input type="date" value={newRate.effective_date} onChange={e => setNewRate(r => ({ ...r, effective_date: e.target.value }))}
              className="border rounded-lg px-2 py-2 text-sm focus:outline-none" />
          </div>
          <button onClick={addMetalRate} className="btn-primary">Add Rate</button>
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-2 pr-4">Metal</th>
                <th className="pb-2 pr-4">Purity</th>
                <th className="pb-2 pr-4">Rate/gram</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {metalRates.slice(0, 10).map((r: any) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4 capitalize">{r.metal_type}</td>
                  <td className="py-2 pr-4">{r.purity}</td>
                  <td className="py-2 pr-4">₹{r.rate_per_gram}</td>
                  <td className="py-2">{r.effective_date?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
