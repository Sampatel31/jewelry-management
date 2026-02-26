'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const statusColors: any = {
  received: 'badge-info', diagnosing: 'badge-warning', in_repair: 'badge-warning',
  ready: 'badge-success', delivered: 'bg-gray-100 text-gray-600',
};

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/repairs', { params: status ? { status } : {} })
      .then(r => setRepairs(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Repairs</h1>
        <Link href="/repairs/new" className="btn-primary flex items-center gap-2"><Plus size={16} /> New Repair</Link>
      </div>
      <div className="card">
        <div className="flex gap-2 mb-4">
          {['', 'received', 'diagnosing', 'in_repair', 'ready', 'delivered'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-colors ${status === s ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        {loading ? <div className="h-64 animate-pulse bg-gray-100 rounded" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-3 pr-4">Repair #</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Item</th>
                <th className="pb-3 pr-4">Received</th>
                <th className="pb-3 pr-4">Est. Cost</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-amber-600">{r.repair_number}</td>
                  <td className="py-3 pr-4">{r.customer_name}</td>
                  <td className="py-3 pr-4 text-gray-600">{r.item_description}</td>
                  <td className="py-3 pr-4">{formatDate(r.received_date)}</td>
                  <td className="py-3 pr-4">{formatCurrency(r.estimated_cost)}</td>
                  <td className="py-3 pr-4"><span className={`badge ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span></td>
                  <td className="py-3"><Link href={`/repairs/${r.id}`} className="text-xs text-blue-500 hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
