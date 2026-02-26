'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const STEPS = [
  { id: 1, title: 'Welcome' },
  { id: 2, title: 'Shop Details' },
  { id: 3, title: 'Admin Account' },
  { id: 4, title: 'GST & Tax' },
  { id: 5, title: 'Invoice Format' },
  { id: 6, title: 'Done' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  if (!password) return null;
  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded ${i <= score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs mt-1 ${score < 3 ? 'text-red-500' : score < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
        {labels[score - 1] || 'Too short'}
      </p>
    </div>
  );
}

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shopInfo, setShopInfo] = useState({
    store_name: 'Shrigar Jewellers',
    owner_name: '',
    store_address: '',
    city: '',
    state: '',
    pin_code: '',
    store_phone: '',
    whatsapp: '',
    store_email: '',
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

  const [gstInfo, setGstInfo] = useState({
    store_gst: '',
    store_state: '',
    hsn_code: '7113',
    default_cgst_rate: '1.5',
    default_sgst_rate: '1.5',
    gold_rate_source: 'manual',
  });

  const [invoiceInfo, setInvoiceInfo] = useState({
    invoice_prefix: 'SJ-',
    invoice_start_number: '1001',
    invoice_footer: 'Thank you for shopping at Shrigar Jewellers!',
    show_bank_details: false,
    bank_name: '',
    bank_account: '',
    bank_ifsc: '',
  });

  const handleShopNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopInfo.store_name) return toast.error('Shop name is required');
    setStep(3);
  };

  const handleAdminNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser.name) return toast.error('Admin name is required');
    if (!adminUser.email) return toast.error('Admin email is required');
    if (adminUser.password !== adminUser.confirmPassword) return toast.error('Passwords do not match');
    if (adminUser.password.length < 8) return toast.error('Password must be at least 8 characters');
    setStep(4);
  };

  const handleGstNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (gstInfo.store_gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstInfo.store_gst)) {
      // Format: 2-digit state code + 5-char PAN + 4-digit entity + 1 check letter + 1 zone + Z + 1 check digit
      return toast.error('Invalid GSTIN format. Example: 22AAAAA0000A1Z5');
    }
    setStep(5);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const fullAddress = [shopInfo.store_address, shopInfo.city, shopInfo.state, shopInfo.pin_code]
        .filter(Boolean).join(', ');

      await api.put('/settings', {
        store_name: shopInfo.store_name,
        owner_name: shopInfo.owner_name,
        store_address: fullAddress,
        store_phone: shopInfo.store_phone,
        store_whatsapp: shopInfo.whatsapp,
        store_email: shopInfo.store_email,
        store_gst: gstInfo.store_gst,
        store_state: gstInfo.store_state || shopInfo.state,
        hsn_code: gstInfo.hsn_code,
        default_cgst_rate: gstInfo.default_cgst_rate,
        default_sgst_rate: gstInfo.default_sgst_rate,
        gold_rate_source: gstInfo.gold_rate_source,
        invoice_prefix: invoiceInfo.invoice_prefix,
        invoice_start_number: invoiceInfo.invoice_start_number,
        invoice_footer: invoiceInfo.invoice_footer,
        show_bank_details: String(invoiceInfo.show_bank_details),
        bank_name: invoiceInfo.bank_name,
        bank_account: invoiceInfo.bank_account,
        bank_ifsc: invoiceInfo.bank_ifsc,
        setup_complete: 'true',
      });

      if (goldRate.rate_per_gram) {
        await api.post('/settings/metal-rates', {
          metal_type: 'gold',
          purity: '24k',
          rate_per_gram: Number(goldRate.rate_per_gram),
          effective_date: goldRate.effective_date,
        });
      }

      if (adminUser.name && adminUser.email && adminUser.password) {
        await api.post('/settings/users', {
          name: adminUser.name,
          email: adminUser.email,
          password: adminUser.password,
          role_name: 'admin',
        });
      }

      setStep(6);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #6B0F1A 0%, #8B1A2A 60%, #6B0F1A 100%)' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💎</div>
          <h1 className="text-3xl font-bold" style={{ color: '#D4AF37', fontFamily: 'Georgia, serif' }}>Shrigar Jewellers</h1>
          <p className="mt-1 text-sm" style={{ color: '#e8d5a3' }}>Management System — Setup Wizard</p>
        </div>

        {/* Step Indicator */}
        {step < 6 && (
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.filter(s => s.id < 6).map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'text-white' : 'bg-white/20 text-white/50'
                }`} style={step === s.id ? { background: '#D4AF37', color: '#6B0F1A' } : {}}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`ml-1.5 text-xs hidden sm:block ${step === s.id ? 'font-medium' : 'text-white/40'}`}
                  style={step === s.id ? { color: '#D4AF37' } : {}}>
                  {s.title}
                </span>
                {i < STEPS.filter(s => s.id < 6).length - 1 && (
                  <div className={`h-0.5 w-6 mx-1 ${step > s.id ? 'bg-green-400' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="text-4xl">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Shrigar Jewellers!</h2>
            <p className="text-gray-500">Let&apos;s set up your store in 5 quick steps. This will only take a few minutes.</p>
            <button onClick={() => setStep(2)} className="btn-primary w-full" style={{ background: '#6B0F1A' }}>
              Get Started →
            </button>
          </div>
        )}

        {/* Step 2: Shop Details */}
        {step === 2 && (
          <form onSubmit={handleShopNext} className="bg-white rounded-2xl p-8 space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800">Step 1 – Shop Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name <span className="text-red-400">*</span></label>
                <input value={shopInfo.store_name} onChange={e => setShopInfo(s => ({ ...s, store_name: e.target.value }))}
                  required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input value={shopInfo.owner_name} onChange={e => setShopInfo(s => ({ ...s, owner_name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={shopInfo.store_address} onChange={e => setShopInfo(s => ({ ...s, store_address: e.target.value }))}
                  rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input value={shopInfo.city} onChange={e => setShopInfo(s => ({ ...s, city: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input value={shopInfo.pin_code} onChange={e => setShopInfo(s => ({ ...s, pin_code: e.target.value }))}
                  maxLength={6} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select value={shopInfo.state} onChange={e => setShopInfo(s => ({ ...s, state: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Select state…</option>
                  {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={shopInfo.store_phone} onChange={e => setShopInfo(s => ({ ...s, store_phone: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="tel" value={shopInfo.whatsapp} onChange={e => setShopInfo(s => ({ ...s, whatsapp: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={shopInfo.store_email} onChange={e => setShopInfo(s => ({ ...s, store_email: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button type="submit" className="btn-primary flex-1">Next →</button>
            </div>
          </form>
        )}

        {/* Step 3: Admin Account */}
        {step === 3 && (
          <form onSubmit={handleAdminNext} className="bg-white rounded-2xl p-8 space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800">Step 2 – Admin Account</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-400">*</span></label>
              <input value={adminUser.name} onChange={e => setAdminUser(u => ({ ...u, name: e.target.value }))}
                required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-400">*</span></label>
              <input type="email" value={adminUser.email} onChange={e => setAdminUser(u => ({ ...u, email: e.target.value }))}
                required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-400">*</span></label>
              <input type="password" value={adminUser.password} onChange={e => setAdminUser(u => ({ ...u, password: e.target.value }))}
                required minLength={8} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <PasswordStrength password={adminUser.password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-400">*</span></label>
              <input type="password" value={adminUser.confirmPassword} onChange={e => setAdminUser(u => ({ ...u, confirmPassword: e.target.value }))}
                required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button type="submit" className="btn-primary flex-1">Next →</button>
            </div>
          </form>
        )}

        {/* Step 4: GST & Tax */}
        {step === 4 && (
          <form onSubmit={handleGstNext} className="bg-white rounded-2xl p-8 space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800">Step 3 – GST & Tax Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input value={gstInfo.store_gst} onChange={e => setGstInfo(g => ({ ...g, store_gst: e.target.value.toUpperCase() }))}
                maxLength={15} placeholder="e.g. 22AAAAA0000A1Z5"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono" />
              <p className="text-xs text-gray-400 mt-1">Format: 22AAAAA0000A1Z5 (15 characters)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State (for GST)</label>
              <select value={gstInfo.store_state} onChange={e => setGstInfo(g => ({ ...g, store_state: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Select state…</option>
                {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                <input value={gstInfo.hsn_code} onChange={e => setGstInfo(g => ({ ...g, hsn_code: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGST %</label>
                <input type="number" step="0.1" value={gstInfo.default_cgst_rate} onChange={e => setGstInfo(g => ({ ...g, default_cgst_rate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SGST %</label>
                <input type="number" step="0.1" value={gstInfo.default_sgst_rate} onChange={e => setGstInfo(g => ({ ...g, default_sgst_rate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gold Rate Source</label>
              <div className="flex gap-4">
                {[['manual', 'Manual Entry'], ['auto', 'Auto (IBJA)']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gold_rate_source" value={val}
                      checked={gstInfo.gold_rate_source === val}
                      onChange={() => setGstInfo(g => ({ ...g, gold_rate_source: val }))}
                      className="text-amber-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1">← Back</button>
              <button type="submit" className="btn-primary flex-1">Next →</button>
            </div>
          </form>
        )}

        {/* Step 5: Invoice Format */}
        {step === 5 && (
          <form onSubmit={e => { e.preventDefault(); handleFinish(); }} className="bg-white rounded-2xl p-8 space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800">Step 4 – Invoice / Bill Format</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Prefix</label>
                <input value={invoiceInfo.invoice_prefix} onChange={e => setInvoiceInfo(i => ({ ...i, invoice_prefix: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
                <input type="number" value={invoiceInfo.invoice_start_number} onChange={e => setInvoiceInfo(i => ({ ...i, invoice_start_number: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Footer Text</label>
              <input value={invoiceInfo.invoice_footer} onChange={e => setInvoiceInfo(i => ({ ...i, invoice_footer: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <input id="bank-toggle" type="checkbox" checked={invoiceInfo.show_bank_details}
                onChange={e => setInvoiceInfo(i => ({ ...i, show_bank_details: e.target.checked }))}
                className="w-4 h-4 text-amber-500" />
              <label htmlFor="bank-toggle" className="text-sm text-gray-700 cursor-pointer">Show bank details on invoice</label>
            </div>
            {invoiceInfo.show_bank_details && (
              <div className="space-y-3 bg-blue-50 rounded-lg p-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input value={invoiceInfo.bank_name} onChange={e => setInvoiceInfo(i => ({ ...i, bank_name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account No.</label>
                    <input value={invoiceInfo.bank_account} onChange={e => setInvoiceInfo(i => ({ ...i, bank_account: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input value={invoiceInfo.bank_ifsc} onChange={e => setInvoiceInfo(i => ({ ...i, bank_ifsc: e.target.value.toUpperCase() }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(4)} className="btn-secondary flex-1">← Back</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving…' : '🚀 Finish Setup'}
              </button>
            </div>
          </form>
        )}

        {/* Step 6: Complete */}
        {step === 6 && (
          <div className="bg-white rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-gray-800">Setup Complete!</h2>
            <p className="text-gray-500">Your store is ready. Welcome to Shrigar Jewellers Management System.</p>
            <button onClick={() => router.push('/login')} className="btn-primary w-full">
              Open Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
