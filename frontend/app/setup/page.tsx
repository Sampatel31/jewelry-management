'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Shop Info' },
  { id: 2, title: 'Gold Rates' },
  { id: 3, title: 'Admin User' },
  { id: 4, title: 'Finish' },
];

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shopInfo, setShopInfo] = useState({
    store_name: '',
    store_address: '',
    store_phone: '',
    store_email: '',
    store_gst: '',
    store_state_code: '',
  });

  const [goldRate, setGoldRate] = useState({
    rate_per_gram: '',
    effective_date: new Date().toISOString().split('T')[0],
  });

  const [adminUser, setAdminUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loadDemoData, setLoadDemoData] = useState(false);

  const handleShopInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopInfo.store_name) return toast.error('Shop name is required');
    setStep(2);
  };

  const handleGoldRateNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleAdminNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser.password !== adminUser.confirmPassword) return toast.error('Passwords do not match');
    if (adminUser.password.length < 8) return toast.error('Password must be at least 8 characters');
    setStep(4);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Save shop settings
      await api.put('/settings', shopInfo);

      // Save gold rate if provided
      if (goldRate.rate_per_gram) {
        await api.post('/settings/metal-rates', {
          metal_type: 'gold',
          purity: '24k',
          rate_per_gram: Number(goldRate.rate_per_gram),
          effective_date: goldRate.effective_date,
        });
      }

      // Create admin user
      if (adminUser.name && adminUser.email && adminUser.password) {
        await api.post('/settings/users', {
          name: adminUser.name,
          email: adminUser.email,
          password: adminUser.password,
          role_name: 'admin',
        });
      }

      // Mark setup as complete
      await api.put('/settings', { setup_complete: 'true' });

      toast.success('Setup complete! Welcome to JewelMS.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💎</div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to JewelMS</h1>
          <p className="text-gray-500 mt-1">Let&apos;s set up your jewelry shop</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`ml-1.5 text-xs hidden sm:block ${step === s.id ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                {s.title}
              </span>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-8 mx-2 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Shop Info */}
        {step === 1 && (
          <form onSubmit={handleShopInfoNext} className="card space-y-4">
            <h2 className="text-lg font-semibold">Step 1 – Shop Information</h2>
            {[
              ['store_name', 'Shop Name', 'text', true],
              ['store_address', 'Address', 'text', false],
              ['store_phone', 'Phone Number', 'tel', false],
              ['store_email', 'Email', 'email', false],
              ['store_gst', 'GSTIN', 'text', false],
              ['store_state_code', 'State Code (e.g. 27 for Maharashtra)', 'text', false],
            ].map(([key, label, type, required]) => (
              <div key={key as string}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label as string} {required && <span className="text-red-400">*</span>}</label>
                <input
                  type={type as string}
                  value={(shopInfo as any)[key as string]}
                  onChange={(e) => setShopInfo((s) => ({ ...s, [key as string]: e.target.value }))}
                  required={required as boolean}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            ))}
            <button type="submit" className="btn-primary w-full">Next →</button>
          </form>
        )}

        {/* Step 2: Gold Rates */}
        {step === 2 && (
          <form onSubmit={handleGoldRateNext} className="card space-y-4">
            <h2 className="text-lg font-semibold">Step 2 – Today&apos;s Gold Rate</h2>
            <p className="text-sm text-gray-500">Enter today&apos;s 24K gold rate per gram (₹). You can skip this and add it later.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">24K Gold Rate / gram (₹)</label>
              <input
                type="number" step="0.01" min="0"
                value={goldRate.rate_per_gram}
                onChange={(e) => setGoldRate((r) => ({ ...r, rate_per_gram: e.target.value }))}
                placeholder="e.g. 7200"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={goldRate.effective_date}
                onChange={(e) => setGoldRate((r) => ({ ...r, effective_date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button type="submit" className="btn-primary flex-1">Next →</button>
            </div>
          </form>
        )}

        {/* Step 3: Admin User */}
        {step === 3 && (
          <form onSubmit={handleAdminNext} className="card space-y-4">
            <h2 className="text-lg font-semibold">Step 3 – Create Admin Account</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-400">*</span></label>
              <input value={adminUser.name} onChange={(e) => setAdminUser((u) => ({ ...u, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-400">*</span></label>
              <input type="email" value={adminUser.email} onChange={(e) => setAdminUser((u) => ({ ...u, email: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-400">*</span></label>
              <input type="password" value={adminUser.password} onChange={(e) => setAdminUser((u) => ({ ...u, password: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-400">*</span></label>
              <input type="password" value={adminUser.confirmPassword} onChange={(e) => setAdminUser((u) => ({ ...u, confirmPassword: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" required />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button type="submit" className="btn-primary flex-1">Next →</button>
            </div>
          </form>
        )}

        {/* Step 4: Finish */}
        {step === 4 && (
          <div className="card space-y-6 text-center">
            <div className="text-5xl">🎉</div>
            <h2 className="text-lg font-semibold">Ready to Launch!</h2>
            <p className="text-sm text-gray-500">Your shop is configured. Click &ldquo;Finish Setup&rdquo; to complete and go to the login page.</p>
            <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-lg p-3">
              <input
                id="demo-data"
                type="checkbox"
                checked={loadDemoData}
                onChange={(e) => setLoadDemoData(e.target.checked)}
                className="w-4 h-4 text-amber-500"
              />
              <label htmlFor="demo-data" className="text-sm text-gray-700">Load sample products &amp; customers (demo data)</label>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleFinish} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Setting up…' : '🚀 Finish Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
