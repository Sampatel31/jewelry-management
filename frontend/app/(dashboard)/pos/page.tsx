'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

interface CartItem {
  product_id: string;
  product_name: string;
  hsn_code: string;
  unit_price: number;
  making_charges: number;
  stone_charges: number;
  quantity: number;
  discount: number;
  cgst_rate: number;
  sgst_rate: number;
  total_price: number;
}

export default function POSPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/customers', { params: { limit: 100 } }).then(r => setCustomers(r.data.customers));
  }, []);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const t = setTimeout(() => {
      api.get('/pos/search', { params: { q: query } }).then(r => setResults(r.data));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const addToCart = (product: any) => {
    setCart(c => {
      const existing = c.find(i => i.product_id === product.id);
      if (existing) {
        return c.map(i => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, total_price: calcTotal({ ...i, quantity: i.quantity + 1 }) }
          : i);
      }
      const item: CartItem = {
        product_id: product.id, product_name: product.name, hsn_code: product.hsn_code || '7113',
        unit_price: Number(product.selling_price), making_charges: Number(product.making_charges),
        stone_charges: 0, quantity: 1, discount: 0,
        cgst_rate: Number(product.cgst_rate), sgst_rate: Number(product.sgst_rate),
        total_price: 0,
      };
      item.total_price = calcTotal(item);
      return [...c, item];
    });
    setQuery('');
    setResults([]);
  };

  const calcTotal = (item: CartItem) => {
    const sub = (item.unit_price + item.making_charges + item.stone_charges) * item.quantity - item.discount;
    return sub * (1 + (item.cgst_rate + item.sgst_rate) / 100);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(c => c.map(i => {
      if (i.product_id !== id) return i;
      const qty = Math.max(1, i.quantity + delta);
      return { ...i, quantity: qty, total_price: calcTotal({ ...i, quantity: qty }) };
    }));
  };

  const removeFromCart = (id: string) => setCart(c => c.filter(i => i.product_id !== id));

  const cartTotal = cart.reduce((sum, i) => sum + i.total_price, 0);
  const change = paidAmount - cartTotal;

  const completeSale = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/pos/sale', {
        items: cart, customer_id: customerId || null,
        payment_mode: paymentMode, paid_amount: paidAmount,
      });
      toast.success(`Sale completed! Invoice: ${data.invoice_number}`);
      setCart([]);
      setPaidAmount(0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem)]">
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-xl font-bold">Point of Sale</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search product by name or barcode..."
            className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          {results.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-64 overflow-y-auto">
              {results.map(p => (
                <button key={p.id} onClick={() => addToCart(p)} className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.sku} | Stock: {p.stock_qty}</div>
                  </div>
                  <div className="font-semibold text-amber-600">{formatCurrency(p.selling_price)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 card overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart size={18} />
            <h2 className="font-semibold">Cart ({cart.length} items)</h2>
          </div>
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Search and add products to cart</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 font-medium">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.product_id} className="border-b">
                    <td className="py-2">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-xs text-gray-400">{formatCurrency(item.unit_price)} + {formatCurrency(item.making_charges)} making</div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => updateQty(item.product_id, -1)} className="p-0.5 rounded hover:bg-gray-100"><Minus size={14} /></button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, 1)} className="p-0.5 rounded hover:bg-gray-100"><Plus size={14} /></button>
                      </div>
                    </td>
                    <td className="py-2 text-right font-semibold">{formatCurrency(item.total_price)}</td>
                    <td className="py-2 pl-2">
                      <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="w-80 flex flex-col gap-3">
        <div className="card">
          <h3 className="font-semibold mb-3">Customer</h3>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">Walk-in Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
          </select>
        </div>
        <div className="card flex-1">
          <h3 className="font-semibold mb-3">Payment</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-amber-600">{formatCurrency(cartTotal)}</span></div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Payment Mode</label>
              <div className="grid grid-cols-3 gap-1">
                {['cash', 'card', 'upi'].map(m => (
                  <button key={m} onClick={() => setPaymentMode(m)}
                    className={`py-1.5 text-xs rounded-lg font-medium capitalize border transition-colors ${paymentMode === m ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-600'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Amount Tendered</label>
              <input type="number" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            {change >= 0 && paidAmount > 0 && (
              <div className="bg-green-50 rounded-lg p-2 text-sm">
                <span className="text-green-700 font-medium">Change: {formatCurrency(change)}</span>
              </div>
            )}
          </div>
          <button onClick={completeSale} disabled={loading || cart.length === 0}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}
