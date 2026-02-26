'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const columns = ['pending', 'in_progress', 'completed', 'cancelled'];
const colColors: any = {
  pending: 'bg-yellow-50 border-yellow-200',
  in_progress: 'bg-blue-50 border-blue-200',
  completed: 'bg-green-50 border-green-200',
  cancelled: 'bg-red-50 border-red-200',
};

export default function ProductionPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    api.get('/production/jobs').then(r => setJobs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/production/jobs/${id}/status`, { status });
      toast.success('Status updated!');
      fetchJobs();
    } catch { toast.error('Failed to update'); }
  };

  const grouped = columns.reduce((acc: any, c) => {
    acc[c] = jobs.filter(j => j.status === c);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Production</h1>
        <Link href="/production/new" className="btn-primary flex items-center gap-2"><Plus size={16} /> New Job</Link>
      </div>
      {loading ? <div className="h-64 animate-pulse bg-gray-100 rounded" /> : (
        <div className="grid grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col} className={`rounded-xl border p-3 ${colColors[col]}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm capitalize">{col.replace('_', ' ')}</h3>
                <span className="badge bg-white text-gray-600 border">{grouped[col].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[col].map((job: any) => (
                  <div key={job.id} className="bg-white rounded-lg p-3 shadow-sm border">
                    <div className="font-mono text-xs text-amber-600 font-semibold">{job.job_number}</div>
                    <div className="font-medium text-sm mt-1">{job.product_name}</div>
                    <div className="text-xs text-gray-500 mt-1">Qty: {job.quantity}</div>
                    {job.expected_date && <div className="text-xs text-gray-400">Due: {formatDate(job.expected_date)}</div>}
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {col !== 'completed' && col !== 'cancelled' && (
                        <>
                          {col === 'pending' && <button onClick={() => updateStatus(job.id, 'in_progress')} className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded">Start</button>}
                          {col === 'in_progress' && <button onClick={() => updateStatus(job.id, 'completed')} className="text-xs px-2 py-0.5 bg-green-500 text-white rounded">Complete</button>}
                          <button onClick={() => updateStatus(job.id, 'cancelled')} className="text-xs px-2 py-0.5 bg-red-400 text-white rounded">Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
