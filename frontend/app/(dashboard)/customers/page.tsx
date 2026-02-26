'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Search, Edit } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: { search, limit: 50 } });
      setCustomers(data.customers);
      setTotal(data.total);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/customers/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Customer
        </Link>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        {loading ? <div className="h-64 bg-gray-100 animate-pulse rounded" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4">Total Purchases</th>
                <th className="pb-3 pr-4">Points</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{c.name}</td>
                  <td className="py-3 pr-4">{c.phone}</td>
                  <td className="py-3 pr-4 text-gray-500">{c.city || '-'}</td>
                  <td className="py-3 pr-4">{formatCurrency(c.total_purchases)}</td>
                  <td className="py-3 pr-4"><span className="badge badge-info">{c.loyalty_points} pts</span></td>
                  <td className="py-3">
                    <Link href={`/customers/${c.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded inline-flex">
                      <Edit size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-2 text-sm text-gray-400">Total: {total}</p>
      </div>
    </div>
  );
}
