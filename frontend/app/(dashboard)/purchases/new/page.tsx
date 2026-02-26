'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Search } from 'lucide-react';

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ supplier_id: '', order_date: new Date().toISOString().split('T')[0], expected_date: '', notes: '', status: 'draft' });

  useEffect(() => {
    api.get('/suppliers').then(r => setSuppliers(r.data));
  }, []);

  useEffect(() => {
    if (!productQuery) { setProductResults([]); return; }
    const t = setTimeout(() => api.get('/pos/search', { params: { q: productQuery } }).then(r => setProductResults(r.data)), 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  const addProduct = (p: any) => {
    setItems(prev => [...prev, { product_id: p.id, product_name: p.name, quantity: 1, unit_price: Number(p.base_price), total_price: Number(p.base_price) }]);
    setProductQuery(''); setProductResults([]);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.total_price = updated.quantity * updated.unit_price;
      return updated;
    }));
  };

  const totalAmount = items.reduce((s, i) => s + i.total_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_id) { toast.error('Select a supplier'); return; }
    try {
      const count = await api.get('/purchases/orders').then(r => r.data.length);
      const poNumber = `PO-${String(count + 1).padStart(4, '0')}`;
      await api.post('/purchases/orders', { ...form, po_number: poNumber, total_amount: totalAmount, items });
      toast.success('Purchase order created!');
      router.push('/purchases');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">New Purchase Order</h1>
      <form onSubmit={handleSubmit}>
        <div className="card mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">Select supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
            <input type="date" value={form.order_date} onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
            <input type="date" value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="draft">Draft</option>
              <option value="ordered">Ordered</option>
            </select>
          </div>
        </div>
        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Add Products</h3>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={productQuery} onChange={e => setProductQuery(e.target.value)} placeholder="Search product..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            {productResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {productResults.map(p => (
                  <button key={p.id} type="button" onClick={() => addProduct(p)}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-sm flex justify-between">
                    <span>{p.name}</span><span className="text-amber-600">₹{p.base_price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500 font-medium text-left"><th className="pb-2 pr-4">Product</th><th className="pb-2 pr-4 w-20">Qty</th><th className="pb-2 pr-4 w-28">Unit Price</th><th className="pb-2 pr-4 w-28 text-right">Total</th><th className="pb-2"></th></tr></thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 pr-4">{item.product_name}</td>
                  <td className="py-2 pr-4"><input type="number" value={item.quantity} min={1} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="w-16 border rounded px-2 py-1 text-xs" /></td>
                  <td className="py-2 pr-4"><input type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} className="w-24 border rounded px-2 py-1 text-xs" /></td>
                  <td className="py-2 pr-4 text-right font-semibold">₹{item.total_price.toFixed(2)}</td>
                  <td className="py-2"><button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-400"><Trash2 size={14} /></button></td>
                </tr>
              ))}
              <tr><td colSpan={3} className="pt-2 text-right font-semibold text-gray-700">Total Amount:</td><td className="pt-2 text-right font-bold text-amber-600">₹{totalAmount.toFixed(2)}</td><td></td></tr>
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create Purchase Order</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
