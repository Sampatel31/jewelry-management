'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Trash2, Search } from 'lucide-react';

interface CartItem {
  product_id: string;
  product_name: string;
  hsn_code: string;
  quantity: number;
  unit_price: number;
  making_charges: number;
  stone_charges: number;
  discount: number;
  cgst_rate: number;
  sgst_rate: number;
  total_price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    customer_id: '', invoice_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash', discount_amount: 0, notes: '',
  });

  useEffect(() => {
    api.get('/customers', { params: { limit: 100 } }).then(r => setCustomers(r.data.customers));
  }, []);

  useEffect(() => {
    if (!productQuery) { setProductResults([]); return; }
    const t = setTimeout(() => {
      api.get('/pos/search', { params: { q: productQuery } }).then(r => setProductResults(r.data));
    }, 300);
    return () => clearTimeout(t);
  }, [productQuery]);

  const addProduct = (p: any) => {
    const item: CartItem = {
      product_id: p.id, product_name: p.name, hsn_code: p.hsn_code || '7113',
      quantity: 1, unit_price: Number(p.selling_price), making_charges: Number(p.making_charges),
      stone_charges: 0, discount: 0, cgst_rate: Number(p.cgst_rate), sgst_rate: Number(p.sgst_rate),
      total_price: 0,
    };
    item.total_price = calcItemTotal(item);
    setItems(prev => [...prev, item]);
    setProductQuery('');
    setProductResults([]);
  };

  const calcItemTotal = (item: CartItem) => {
    const sub = (item.unit_price + item.making_charges + item.stone_charges) * item.quantity - item.discount;
    return sub * (1 + (item.cgst_rate + item.sgst_rate) / 100);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.total_price = calcItemTotal(updated);
      return updated;
    }));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => {
    const base = (i.unit_price + i.making_charges + i.stone_charges) * i.quantity - i.discount;
    return s + base;
  }, 0);
  const cgstTotal = items.reduce((s, i) => {
    const base = (i.unit_price + i.making_charges + i.stone_charges) * i.quantity - i.discount;
    return s + base * i.cgst_rate / 100;
  }, 0);
  const sgstTotal = items.reduce((s, i) => {
    const base = (i.unit_price + i.making_charges + i.stone_charges) * i.quantity - i.discount;
    return s + base * i.sgst_rate / 100;
  }, 0);
  const grandTotal = subtotal + cgstTotal + sgstTotal - form.discount_amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Add at least one item'); return; }
    try {
      const invCount = await api.get('/billing/invoices', { params: { limit: 1 } });
      const num = `INV-${String((invCount.data.total || 0) + 1).padStart(6, '0')}`;
      await api.post('/billing/invoices', {
        ...form, invoice_number: num, items,
        subtotal, cgst_amount: cgstTotal, sgst_amount: sgstTotal,
        total_amount: grandTotal, paid_amount: 0, payment_status: 'unpaid',
        customer_id: form.customer_id || null,
      });
      toast.success('Invoice created!');
      router.push('/billing');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  return (
    <div className="max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold">New Invoice</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input type="date" value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {['cash', 'card', 'upi', 'cheque', 'emi', 'mixed'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                <input type="number" value={form.discount_amount} onChange={e => setForm(f => ({ ...f, discount_amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">CGST</span><span>{formatCurrency(cgstTotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">SGST</span><span>{formatCurrency(sgstTotal)}</span></div>
              {form.discount_amount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-{formatCurrency(form.discount_amount)}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t pt-1 mt-2"><span>Total</span><span className="text-amber-600">{formatCurrency(grandTotal)}</span></div>
            </div>
          </div>
        </div>
        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Add Products</h3>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={productQuery} onChange={e => setProductQuery(e.target.value)}
              placeholder="Search product by name or barcode..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            {productResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {productResults.map(p => (
                  <button key={p.id} type="button" onClick={() => addProduct(p)}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 flex justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-amber-600">{formatCurrency(p.selling_price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium text-xs">
                <th className="pb-2 pr-2">Product</th>
                <th className="pb-2 pr-2 w-16">Qty</th>
                <th className="pb-2 pr-2 w-24">Unit Price</th>
                <th className="pb-2 pr-2 w-24">Making</th>
                <th className="pb-2 pr-2 w-20">Discount</th>
                <th className="pb-2 pr-2 w-16">CGST%</th>
                <th className="pb-2 pr-2 w-16">SGST%</th>
                <th className="pb-2 pr-2 w-28 text-right">Total</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 pr-2 font-medium">{item.product_name}</td>
                  <td className="py-2 pr-2">
                    <input type="number" value={item.quantity} min={1} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-14 border rounded px-2 py-1 text-xs" />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-22 border rounded px-2 py-1 text-xs" />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" value={item.making_charges} onChange={e => updateItem(idx, 'making_charges', parseFloat(e.target.value) || 0)}
                      className="w-22 border rounded px-2 py-1 text-xs" />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" value={item.discount} onChange={e => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-18 border rounded px-2 py-1 text-xs" />
                  </td>
                  <td className="py-2 pr-2 text-gray-500 text-xs">{item.cgst_rate}%</td>
                  <td className="py-2 pr-2 text-gray-500 text-xs">{item.sgst_rate}%</td>
                  <td className="py-2 pr-2 font-semibold text-right">{formatCurrency(item.total_price)}</td>
                  <td className="py-2">
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create Invoice</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
