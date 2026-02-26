'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [receiving, setReceiving] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<any>({});

  const fetchOrder = () => api.get(`/purchases/orders/${id}`).then(r => setOrder(r.data));
  useEffect(() => { fetchOrder(); }, [id]);

  const receiveGoods = async () => {
    const items = (order.items || []).map((item: any) => ({
      id: item.id, product_id: item.product_id, received_qty: receivedQtys[item.id] ?? item.quantity,
    }));
    try {
      await api.put(`/purchases/orders/${id}/receive`, { items });
      toast.success('Goods received!');
      fetchOrder();
      setReceiving(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (!order) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  const statusBadge: any = { draft: 'badge-info', ordered: 'badge-warning', received: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-bold">PO {order.po_number}</h1>
        <span className={`badge ${statusBadge[order.status]}`}>{order.status}</span>
        {order.status === 'ordered' && (
          <button onClick={() => setReceiving(!receiving)} className="ml-auto btn-primary text-sm">Receive Goods</button>
        )}
      </div>
      <div className="card">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Supplier:</span> {order.supplier_name}</div>
          <div><span className="text-gray-500">Order Date:</span> {formatDate(order.order_date)}</div>
          <div><span className="text-gray-500">Expected:</span> {order.expected_date ? formatDate(order.expected_date) : '-'}</div>
          <div><span className="text-gray-500">Total:</span> <span className="font-semibold">{formatCurrency(order.total_amount)}</span></div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-3">Items</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-500 font-medium text-left"><th className="pb-2 pr-4">Product</th><th className="pb-2 pr-4">Ordered</th><th className="pb-2 pr-4">Received</th>{receiving && <th className="pb-2">Receive Qty</th>}<th className="pb-2 text-right">Total</th></tr></thead>
          <tbody>
            {(order.items || []).map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="py-2 pr-4">{item.product_name}</td>
                <td className="py-2 pr-4">{item.quantity}</td>
                <td className="py-2 pr-4">{item.received_qty}</td>
                {receiving && <td className="py-2 pr-4"><input type="number" defaultValue={item.quantity} min={0} max={item.quantity} onChange={e => setReceivedQtys((r: any) => ({ ...r, [item.id]: parseInt(e.target.value) || 0 }))} className="w-16 border rounded px-2 py-1 text-xs" /></td>}
                <td className="py-2 font-semibold text-right">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {receiving && (
          <div className="flex gap-2 mt-4">
            <button onClick={receiveGoods} className="btn-primary text-sm">Confirm Receipt</button>
            <button onClick={() => setReceiving(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
