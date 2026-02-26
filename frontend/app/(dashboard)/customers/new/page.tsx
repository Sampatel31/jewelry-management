'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', gst_number: '', birthday: '', anniversary_date: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', form);
      toast.success('Customer created!');
      router.push('/customers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const f = (label: string, key: string, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        required={required} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Customer</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {f('Name', 'name', 'text', true)}
          {f('Phone', 'phone', 'tel', true)}
          {f('Email', 'email', 'email')}
          {f('City', 'city')}
          {f('State', 'state')}
          {f('Pincode', 'pincode')}
          {f('GST Number', 'gst_number')}
          {f('Birthday', 'birthday', 'date')}
          {f('Anniversary', 'anniversary_date', 'date')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" rows={2} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create Customer</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
