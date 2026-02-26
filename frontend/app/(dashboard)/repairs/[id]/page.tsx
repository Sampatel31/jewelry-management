'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const statusList = ['received', 'diagnosing', 'in_repair', 'ready', 'delivered'];
const statusColors: any = { received: 'badge-info', diagnosing: 'badge-warning', in_repair: 'badge-warning', ready: 'badge-success', delivered: 'bg-gray-100 text-gray-600' };

export default function RepairDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchRepair = () => api.get(`/repairs/${id}`).then(r => { setRepair(r.data); setForm(r.data); });
  useEffect(() => { fetchRepair(); }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/repairs/${id}/status`, { status });
      toast.success('Status updated!');
      fetchRepair();
    } catch { toast.error('Failed to update'); }
  };

  const handleSave = async () => {
    try {
      await api.put(`/repairs/${id}`, form);
      toast.success('Repair updated!');
      setRepair(form);
      setEditing(false);
    } catch { toast.error('Failed to update'); }
  };

  if (!repair) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-bold">Repair {repair.repair_number}</h1>
        <span className={`badge ${statusColors[repair.status]}`}>{repair.status.replace('_', ' ')}</span>
        <div className="ml-auto flex gap-2">
          {editing ? (
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm"><Save size={16} /> Save</button>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit</button>
          )}
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-3">Repair Details</h3>
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Item Description</label>
              <input value={form.item_description} onChange={e => setForm((f: any) => ({ ...f, item_description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Issue</label>
              <textarea value={form.issue_description} onChange={e => setForm((f: any) => ({ ...f, issue_description: e.target.value }))} rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['estimated_cost', 'Est. Cost', 'number'], ['final_cost', 'Final Cost', 'number'], ['advance_paid', 'Advance Paid', 'number']].map(([k, l, t]) => (
                <div key={k}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{l}</label>
                  <input type={t} value={form[k] || ''} onChange={e => setForm((f: any) => ({ ...f, [k]: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Customer:</span> {repair.customer_name}</div>
            <div><span className="text-gray-500">Phone:</span> {repair.customer_phone}</div>
            <div><span className="text-gray-500">Item:</span> {repair.item_description}</div>
            <div><span className="text-gray-500">Received:</span> {formatDate(repair.received_date)}</div>
            <div><span className="text-gray-500">Expected:</span> {repair.expected_date ? formatDate(repair.expected_date) : '-'}</div>
            <div><span className="text-gray-500">Est. Cost:</span> {formatCurrency(repair.estimated_cost)}</div>
            <div><span className="text-gray-500">Final Cost:</span> {repair.final_cost ? formatCurrency(repair.final_cost) : '-'}</div>
            <div><span className="text-gray-500">Advance Paid:</span> {formatCurrency(repair.advance_paid)}</div>
            <div className="col-span-2"><span className="text-gray-500">Issue:</span> {repair.issue_description}</div>
            {repair.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> {repair.notes}</div>}
          </div>
        )}
      </div>
      <div className="card">
        <h3 className="font-semibold mb-3">Update Status</h3>
        <div className="flex gap-2 flex-wrap">
          {statusList.map(s => (
            <button key={s} onClick={() => updateStatus(s)} disabled={repair.status === s}
              className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-colors capitalize ${repair.status === s ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
