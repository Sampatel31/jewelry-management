'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Download, HardDrive, Clock } from 'lucide-react';
import RequireRole from '@/components/auth/RequireRole';

function BackupContent() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['backups'],
    queryFn: () => api.get('/backup/list').then((r) => r.data),
  });

  const handleExport = async () => {
    try {
      const response = await api.get('/backup/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename="(.+)"/);
      a.download = match ? match[1] : `backup-${new Date().toISOString().split('T')[0]}.sql`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Backup downloaded');
      refetch();
    } catch {
      toast.error('Backup export failed');
    }
  };

  const backups = data?.backups ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HardDrive className="text-amber-500" />
        <h1 className="text-2xl font-bold">Backup &amp; Restore</h1>
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Export Database Backup</h2>
          <p className="text-sm text-gray-500 mt-1">
            Download a full backup of the database. Store it in a safe location.
          </p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download size={16} /> Download Backup
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Clock size={16} /> Backup History
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-2 pr-4">Filename</th>
                <th className="pb-2 pr-4">Size</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-gray-400">No backups found</td></tr>
              )}
              {backups.map((b: any) => (
                <tr key={b.filename} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono">{b.filename}</td>
                  <td className="py-2 pr-4">{(b.size / 1024).toFixed(1)} KB</td>
                  <td className="py-2 text-gray-500">{new Date(b.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function BackupPage() {
  return (
    <RequireRole roles={['admin']} fallback={
      <div className="card text-center py-16 text-gray-400">
        <HardDrive size={40} className="mx-auto mb-3 opacity-30" />
        <p>Access denied. Only administrators can manage backups.</p>
      </div>
    }>
      <BackupContent />
    </RequireRole>
  );
}
