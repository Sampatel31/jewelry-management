'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    entity_type: '', user_id: '', from: '', to: '',
  });

  const load = () => {
    setLoading(true);
    const params: any = { page, limit: 50 };
    if (filters.entity_type) params.entity_type = filters.entity_type;
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    api.get('/audit-logs', { params })
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total); })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <input className="input w-40" placeholder="Entity type (e.g. invoices)" value={filters.entity_type}
            onChange={e => setFilters(f => ({ ...f, entity_type: e.target.value }))} />
          <input className="input w-48" placeholder="User ID" value={filters.user_id}
            onChange={e => setFilters(f => ({ ...f, user_id: e.target.value }))} />
          <input type="date" className="input" value={filters.from}
            onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
          <input type="date" className="input" value={filters.to}
            onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
          <button onClick={() => { setPage(1); load(); }} className="btn-primary">Filter</button>
          <button onClick={() => { setFilters({ entity_type: '', user_id: '', from: '', to: '' }); setPage(1); }} className="btn-secondary">Clear</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <div className="h-64 animate-pulse bg-gray-100 rounded" /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Entity</th>
                <th className="pb-3 pr-4">Record ID</th>
                <th className="pb-3">Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <React.Fragment key={log.id}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4 text-xs text-gray-500">{formatDate(log.created_at)}</td>
                    <td className="py-3 pr-4">{log.user_name || <span className="text-gray-400">System</span>}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${log.action === 'DELETE' ? 'badge-danger' : log.action === 'CREATE' ? 'badge-success' : 'badge-warning'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs font-mono">{log.table_name}</td>
                    <td className="py-3 pr-4 text-xs font-mono text-gray-500 truncate max-w-xs">{log.record_id}</td>
                    <td className="py-3">
                      {(log.old_values || log.new_values) && (
                        <button onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                          className="text-xs text-blue-500 hover:underline">
                          {expanded === log.id ? 'Hide' : 'Show diff'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                          {log.old_values && (
                            <div>
                              <div className="text-red-600 font-semibold mb-1">Old Value</div>
                              <pre className="bg-red-50 rounded p-2 overflow-auto max-h-40">{JSON.stringify(log.old_values, null, 2)}</pre>
                            </div>
                          )}
                          {log.new_values && (
                            <div>
                              <div className="text-green-600 font-semibold mb-1">New Value</div>
                              <pre className="bg-green-50 rounded p-2 overflow-auto max-h-40">{JSON.stringify(log.new_values, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No audit logs found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Total: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
            <span className="px-3 py-1">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page * 50 >= total} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
