'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const statusBadge: any = {
  draft: 'badge-info', ordered: 'badge-warning', received: 'badge-success', cancelled: 'badge-danger',
};

export default function PurchasesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/purchases/orders').then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Link href="/purchases/new" className="btn-primary flex items-center gap-2"><Plus size={16} /> New Order</Link>
      </div>
      <div className="card">
        {loading ? <div className="h-64 animate-pulse bg-gray-100 rounded" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-3 pr-4">PO Number</th>
                <th className="pb-3 pr-4">Supplier</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-amber-600">{o.po_number}</td>
                  <td className="py-3 pr-4">{o.supplier_name}</td>
                  <td className="py-3 pr-4">{formatDate(o.order_date)}</td>
                  <td className="py-3 pr-4">{formatCurrency(o.total_amount)}</td>
                  <td className="py-3 pr-4"><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span></td>
                  <td className="py-3"><Link href={`/purchases/${o.id}`} className="text-xs text-blue-500 hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
