'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', city: '', state: '', gst_number: '' });

  const fetchSuppliers = () => {
    api.get('/suppliers').then(r => setSuppliers(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchSuppliers(); }, []);

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, contact_person: s.contact_person, phone: s.phone, email: s.email || '', city: s.city || '', state: s.state || '', gst_number: s.gst_number || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/suppliers/${editing.id}`, form); toast.success('Supplier updated!'); }
      else { await api.post('/suppliers', form); toast.success('Supplier created!'); }
      setShowForm(false); setEditing(null);
      setForm({ name: '', contact_person: '', phone: '', email: '', city: '', state: '', gst_number: '' });
      fetchSuppliers();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', contact_person: '', phone: '', email: '', city: '', state: '', gst_number: '' }); setShowForm(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Supplier</button>
      </div>
      <div className="card">
        {loading ? <div className="h-64 animate-pulse bg-gray-100 rounded" /> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500 font-medium text-left"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4">Contact</th><th className="pb-3 pr-4">Phone</th><th className="pb-3 pr-4">City</th><th className="pb-3 pr-4">GST</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{s.name}</td>
                  <td className="py-3 pr-4">{s.contact_person || '-'}</td>
                  <td className="py-3 pr-4">{s.phone}</td>
                  <td className="py-3 pr-4">{s.city || '-'}</td>
                  <td className="py-3 pr-4 text-xs">{s.gst_number || '-'}</td>
                  <td className="py-3"><button onClick={() => openEdit(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Supplier</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[['name', 'Name *', 'text', true], ['contact_person', 'Contact Person', 'text', false], ['phone', 'Phone *', 'tel', true], ['email', 'Email', 'email', false], ['city', 'City', 'text', false], ['state', 'State', 'text', false], ['gst_number', 'GST Number', 'text', false]].map(([k, l, t, r]) => (
                <div key={k as string}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{l as string}</label>
                  <input type={t as string} value={(form as any)[k as string]} required={r as boolean} onChange={e => setForm(f => ({ ...f, [k as string]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
