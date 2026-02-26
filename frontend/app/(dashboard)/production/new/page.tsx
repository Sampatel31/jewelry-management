'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

export default function NewProductionJobPage() {
  const router = useRouter();
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [form, setForm] = useState({ quantity: 1, start_date: '', expected_date: '', notes: '' });

  useEffect(() => {
    if (!productQuery) { setProductResults([]); return; }
    const t = setTimeout(() => api.get('/pos/search', { params: { q: productQuery } }).then(r => setProductResults(r.data)), 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  const selectProduct = (p: any) => {
    setSelectedProduct(p);
    setProductQuery(p.name);
    setProductResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) { toast.error('Select a product'); return; }
    try {
      await api.post('/production/jobs', { product_id: selectedProduct.id, ...form });
      toast.success('Production job created!');
      router.push('/production');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Production Job</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={productQuery} onChange={e => setProductQuery(e.target.value)} placeholder="Search product..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            {productResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {productResults.map(p => (
                  <button key={p.id} type="button" onClick={() => selectProduct(p)} className="w-full text-left px-4 py-2 hover:bg-amber-50 text-sm">{p.name}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
          <input type="number" value={form.quantity} min={1} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
            <input type="date" value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create Job</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
