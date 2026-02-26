'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ReportsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [gst, setGst] = useState<any[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    Promise.all([
      api.get('/reports/sales', { params }),
      api.get('/reports/top-products'),
      api.get('/reports/gst', { params }),
    ]).then(([s, p, g]) => {
      setSales(s.data);
      setTopProducts(p.data);
      setGst(g.data);
    });
  }, [from, to]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2 items-center">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded px-2 py-1.5 text-sm" />
          <span className="text-gray-500">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded px-2 py-1.5 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Sales by Day</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Line type="monotone" dataKey="total" stroke="#D4AF37" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="total_revenue" fill="#D4AF37" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card col-span-2">
          <h2 className="text-lg font-semibold mb-4">GST Summary</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-2 pr-4">Month</th>
                <th className="pb-2 pr-4">CGST</th>
                <th className="pb-2 pr-4">SGST</th>
                <th className="pb-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {gst.map((g: any) => (
                <tr key={g.month} className="border-b">
                  <td className="py-2 pr-4">{g.month}</td>
                  <td className="py-2 pr-4">{formatCurrency(g.cgst)}</td>
                  <td className="py-2 pr-4">{formatCurrency(g.sgst)}</td>
                  <td className="py-2">{formatCurrency(g.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
