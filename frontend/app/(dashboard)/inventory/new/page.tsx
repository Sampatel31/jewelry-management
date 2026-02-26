'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    sku: '', name: '', category_id: '', metal_type: 'gold', metal_purity: '22k',
    metal_weight_gm: 0, making_charges: 0, base_price: 0, selling_price: 0,
    stock_qty: 0, min_stock_qty: 5, barcode: '', hsn_code: '7113',
    cgst_rate: 1.5, sgst_rate: 1.5, description: '',
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      toast.success('Product created!');
      router.push('/inventory');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const field = (label: string, key: string, type = 'text', opts?: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} value={(form as any)[key]}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        {...opts}
      />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {field('SKU *', 'sku', 'text', { required: true })}
          {field('Name *', 'name', 'text', { required: true })}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metal Type</label>
            <select value={form.metal_type} onChange={e => setForm(f => ({ ...f, metal_type: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purity</label>
            <select value={form.metal_purity} onChange={e => setForm(f => ({ ...f, metal_purity: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="24k">24K</option>
              <option value="22k">22K</option>
              <option value="18k">18K</option>
              <option value="14k">14K</option>
              <option value="925">925 Silver</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {field('Metal Weight (gm)', 'metal_weight_gm', 'number')}
          {field('Making Charges', 'making_charges', 'number')}
          {field('Selling Price *', 'selling_price', 'number', { required: true })}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {field('Stock Qty', 'stock_qty', 'number')}
          {field('Min Stock', 'min_stock_qty', 'number')}
          {field('Barcode', 'barcode')}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {field('HSN Code', 'hsn_code')}
          {field('CGST %', 'cgst_rate', 'number')}
          {field('SGST %', 'sgst_rate', 'number')}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Create Product</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
