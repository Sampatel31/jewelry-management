'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';

const TABS = [
  ['store', '🏪 Shop Details'],
  ['gst', '🧾 GST & Tax'],
  ['metal', '⚖️ Metal Rates'],
  ['invoice', '📄 Invoice'],
  ['users', '👥 Users'],
  ['backup', '💾 Backup'],
  ['appearance', '🎨 Appearance'],
];

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400';
const toggleCls = (on: boolean) =>
  `relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${on ? 'bg-amber-500' : 'bg-gray-300'}`;

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [metalRates, setMetalRates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newRate, setNewRate] = useState({ metal_type: 'gold', purity: '22k', rate_per_gram: 0, effective_date: new Date().toISOString().split('T')[0] });
  const [tab, setTab] = useState('store');
  const [backups, setBackups] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role_name: 'staff' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const { theme, setTheme } = useTheme();

  // Derived 24K gold rate for auto-calc
  const gold24k = parseFloat(settings.gold_rate_24k) || 0;
  const goldRates = {
    '22k': ((gold24k * 22) / 24).toFixed(2),
    '18k': ((gold24k * 18) / 24).toFixed(2),
    '14k': ((gold24k * 14) / 24).toFixed(2),
  };

  // Auto financial year
  const now = new Date();
  const fy = now.getMonth() >= 3
    ? `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(2)}`
    : `${now.getFullYear() - 1}-${String(now.getFullYear()).slice(2)}`;

  // GSTIN validation
  const gstinValid = !settings.gstin || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(settings.gstin);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data));
    api.get('/settings/metal-rates').then(r => setMetalRates(r.data));
  }, []);

  useEffect(() => {
    if (tab === 'backup') {
      api.get('/backup/list').then(r => setBackups(r.data.backups || [])).catch(() => {});
    }
    if (tab === 'users') {
      api.get('/settings/users').then(r => setUsers(r.data)).catch(() => {});
    }
  }, [tab]);

  const set = (key: string, value: string | boolean) =>
    setSettings((s: any) => ({ ...s, [key]: value }));

  const saveSettings = async () => {
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
  };

  const addMetalRate = async () => {
    try {
      const { data } = await api.post('/settings/metal-rates', newRate);
      setMetalRates(r => [data, ...r]);
      toast.success('Rate added!');
    } catch { toast.error('Failed to add rate'); }
  };

  const createBackup = async () => {
    setBackupLoading(true);
    try {
      const { data } = await api.post('/backup/create');
      toast.success(`Backup created: ${data.filename}`);
      api.get('/backup/list').then(r => setBackups(r.data.backups || [])).catch(() => {});
    } catch { toast.error('Backup failed. Please try again.'); }
    finally { setBackupLoading(false); }
  };

  const downloadBackup = (filename: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const url = `${baseUrl}/backup/download/${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = url;
    if (token) {
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          a.href = blobUrl;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(blobUrl);
        });
    }
  };

  const addUser = async () => {
    try {
      await api.post('/settings/users', userForm);
      toast.success('User created');
      setShowUserForm(false);
      setUserForm({ name: '', email: '', password: '', role_name: 'staff' });
      api.get('/settings/users').then(r => setUsers(r.data)).catch(() => {});
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create user'); }
  };

  const toggleUserActive = async (id: string, active: boolean) => {
    try {
      await api.put(`/settings/users/${id}`, { is_active: !active });
      api.get('/settings/users').then(r => setUsers(r.data)).catch(() => {});
      toast.success(active ? 'User deactivated' : 'User activated');
    } catch { toast.error('Failed'); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex gap-2 border-b pb-2 flex-wrap">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${tab === key ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Shop & Business Details ── */}
      {tab === 'store' && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Shop &amp; Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="Store Name">
              <input value={settings.store_name || ''} onChange={e => set('store_name', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="Owner Name">
              <input value={settings.owner_name || ''} onChange={e => set('owner_name', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="Store Address">
              <input value={settings.store_address || ''} onChange={e => set('store_address', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="City">
              <input value={settings.city || ''} onChange={e => set('city', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="State">
              <input value={settings.state || ''} onChange={e => set('state', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="PIN Code">
              <input value={settings.pin_code || ''} onChange={e => set('pin_code', e.target.value)} className={inputCls} maxLength={6} />
            </FieldRow>
            <FieldRow label="Store Phone">
              <input value={settings.store_phone || ''} onChange={e => set('store_phone', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="WhatsApp Number">
              <input value={settings.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="Store Email">
              <input type="email" value={settings.store_email || ''} onChange={e => set('store_email', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="Business Registration No. (optional)">
              <input value={settings.business_reg_number || ''} onChange={e => set('business_reg_number', e.target.value)} className={inputCls} />
            </FieldRow>
          </div>
          <FieldRow label="Store Logo (paste base64 or URL)">
            <textarea value={settings.store_logo || ''} onChange={e => set('store_logo', e.target.value)}
              className={`${inputCls} h-20 font-mono text-xs resize-none`} placeholder="data:image/png;base64,..." />
          </FieldRow>
          {settings.store_logo && (
            <img src={settings.store_logo} alt="Store logo preview" className="h-16 object-contain border rounded" />
          )}
          <button onClick={saveSettings} className="btn-primary">Save Shop Details</button>
        </div>
      )}

      {/* ── Tab 2: GST & Tax Settings ── */}
      {tab === 'gst' && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">GST &amp; Tax Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="GSTIN">
              <input value={settings.gstin || ''} onChange={e => set('gstin', e.target.value.toUpperCase())}
                className={`${inputCls} ${!gstinValid ? 'border-red-400' : ''}`} maxLength={15} placeholder="22AAAAA0000A1Z5" />
              {!gstinValid && <p className="text-xs text-red-500 mt-1">Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)</p>}
            </FieldRow>
            <FieldRow label="GST Registration Type">
              <select value={settings.gst_registration_type || 'regular'} onChange={e => set('gst_registration_type', e.target.value)} className={inputCls}>
                <option value="regular">Regular</option>
                <option value="composition">Composition</option>
                <option value="unregistered">Unregistered</option>
              </select>
            </FieldRow>
            <FieldRow label="CGST Rate (%)">
              <input type="number" step="0.01" value={settings.cgst_rate || settings.default_cgst_rate || ''} onChange={e => set('cgst_rate', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="SGST Rate (%)">
              <input type="number" step="0.01" value={settings.sgst_rate || settings.default_sgst_rate || ''} onChange={e => set('sgst_rate', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="IGST Rate (%)">
              <input type="number" step="0.01" value={settings.igst_rate || ''} onChange={e => set('igst_rate', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="HSN Code (Gold)">
              <input value={settings.hsn_gold || '7108'} onChange={e => set('hsn_gold', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="HSN Code (Silver)">
              <input value={settings.hsn_silver || '7106'} onChange={e => set('hsn_silver', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="HSN Code (Diamond)">
              <input value={settings.hsn_diamond || '7102'} onChange={e => set('hsn_diamond', e.target.value)} className={inputCls} />
            </FieldRow>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={toggleCls(!!settings.gst_enabled)} onClick={() => set('gst_enabled', !settings.gst_enabled)}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.gst_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </span>
              <span className="text-sm font-medium text-gray-700">Enable GST on invoices</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={toggleCls(!!settings.tax_inclusive)} onClick={() => set('tax_inclusive', !settings.tax_inclusive)}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.tax_inclusive ? 'translate-x-6' : 'translate-x-1'}`} />
              </span>
              <span className="text-sm font-medium text-gray-700">Tax-inclusive pricing</span>
            </label>
          </div>
          <div className="text-sm text-gray-500">Financial Year: <span className="font-semibold text-gray-800">{fy}</span></div>
          <button onClick={saveSettings} className="btn-primary">Save GST Settings</button>
        </div>
      )}

      {/* ── Tab 3: Metal Rates ── */}
      {tab === 'metal' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Metal Rates</h2>
            <button onClick={() => toast('IBJA API not connected — enter rate manually', { icon: 'ℹ️' })}
              className="text-sm px-3 py-1.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50">
              🔄 Refresh from IBJA
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">24K Gold Rate (₹/gram)</label>
              <input type="number" value={settings.gold_rate_24k || ''} onChange={e => set('gold_rate_24k', e.target.value)}
                className={inputCls} placeholder="e.g. 6200" />
              <p className="text-xs text-gray-400 mt-1">Last updated: {settings.gold_rate_updated || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Silver Rate (₹/gram)</label>
              <input type="number" value={settings.silver_rate || ''} onChange={e => set('silver_rate', e.target.value)}
                className={inputCls} placeholder="e.g. 78" />
            </div>
          </div>
          {gold24k > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(goldRates).map(([purity, rate]) => (
                <div key={purity} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 uppercase font-medium">{purity}</div>
                  <div className="text-lg font-bold text-amber-700">₹{rate}</div>
                  <div className="text-xs text-gray-400">/gram</div>
                </div>
              ))}
            </div>
          )}
          <hr />
          <h3 className="font-semibold">Add Rate Entry</h3>
          <div className="grid grid-cols-4 gap-3">
            <select value={newRate.metal_type} onChange={e => setNewRate(r => ({ ...r, metal_type: e.target.value }))}
              className={inputCls}>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
            </select>
            <input placeholder="Purity (e.g. 22k)" value={newRate.purity} onChange={e => setNewRate(r => ({ ...r, purity: e.target.value }))}
              className={inputCls} />
            <input type="number" placeholder="Rate/gram" value={newRate.rate_per_gram} onChange={e => setNewRate(r => ({ ...r, rate_per_gram: parseFloat(e.target.value) || 0 }))}
              className={inputCls} />
            <input type="date" value={newRate.effective_date} onChange={e => setNewRate(r => ({ ...r, effective_date: e.target.value }))}
              className={inputCls} />
          </div>
          <button onClick={addMetalRate} className="btn-primary">Add Rate</button>
          <h3 className="font-semibold">Rate History (Last 7 days)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-2 pr-4">Metal</th><th className="pb-2 pr-4">Purity</th>
                <th className="pb-2 pr-4">Rate/gram</th><th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {metalRates.slice(0, 7).map((r: any) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4 capitalize">{r.metal_type}</td>
                  <td className="py-2 pr-4">{r.purity}</td>
                  <td className="py-2 pr-4">₹{r.rate_per_gram}</td>
                  <td className="py-2">{r.effective_date?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={saveSettings} className="btn-primary">Save Gold/Silver Rates</button>
        </div>
      )}

      {/* ── Tab 4: Invoice Settings ── */}
      {tab === 'invoice' && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Invoice Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="Invoice Prefix (e.g. INV)">
              <input value={settings.invoice_prefix || 'INV'} onChange={e => set('invoice_prefix', e.target.value)} className={inputCls} />
            </FieldRow>
            <FieldRow label="Next Invoice Number">
              <input type="number" value={settings.invoice_next_number || '1'} onChange={e => set('invoice_next_number', e.target.value)} className={inputCls} />
              <p className="text-xs text-amber-600 mt-1">⚠️ Changing this may cause duplicate invoice numbers</p>
            </FieldRow>
            <FieldRow label="Paper Size">
              <select value={settings.invoice_paper_size || 'A4'} onChange={e => set('invoice_paper_size', e.target.value)} className={inputCls}>
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="thermal80">Thermal 80mm</option>
              </select>
            </FieldRow>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 font-mono">
            Preview: {settings.invoice_prefix || 'INV'}/{fy}/{String(settings.invoice_next_number || 1).padStart(5, '0')}
          </div>
          <FieldRow label="Invoice Footer Text">
            <textarea value={settings.invoice_footer || ''} onChange={e => set('invoice_footer', e.target.value)}
              className={`${inputCls} h-20 resize-none`} placeholder="Thank you for your business!" />
          </FieldRow>
          <FieldRow label="Terms &amp; Conditions">
            <textarea value={settings.invoice_terms || ''} onChange={e => set('invoice_terms', e.target.value)}
              className={`${inputCls} h-24 resize-none`} placeholder="Goods once sold will not be taken back..." />
          </FieldRow>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Show on Invoice:</p>
            {[
              ['invoice_show_logo', 'Store Logo'],
              ['invoice_show_gstin', 'GSTIN'],
              ['invoice_show_signature', 'Signature Line'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <span className={toggleCls(settings[key] !== 'false' && !!settings[key] !== false)}
                  onClick={() => set(key, String(!(settings[key] !== 'false' && !!settings[key])))}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(settings[key] !== 'false' && !!settings[key]) ? 'translate-x-6' : 'translate-x-1'}`} />
                </span>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
          <button onClick={saveSettings} className="btn-primary">Save Invoice Settings</button>
        </div>
      )}

      {/* ── Tab 5: User Management ── */}
      {tab === 'users' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">User Management</h2>
            <button onClick={() => setShowUserForm(v => !v)} className="btn-primary text-sm">
              + Add User
            </button>
          </div>
          {showUserForm && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <h3 className="font-semibold text-sm">New User</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['name', 'email', 'password'] as const).map(f => (
                  <FieldRow key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
                    <input type={f === 'password' ? 'password' : 'text'} value={userForm[f]}
                      onChange={e => setUserForm(u => ({ ...u, [f]: e.target.value }))} className={inputCls} />
                  </FieldRow>
                ))}
                <FieldRow label="Role">
                  <select value={userForm.role_name} onChange={e => setUserForm(u => ({ ...u, role_name: e.target.value }))} className={inputCls}>
                    {['admin', 'manager', 'staff', 'accountant'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </FieldRow>
              </div>
              <div className="flex gap-2">
                <button onClick={addUser} className="btn-primary text-sm">Create User</button>
                <button onClick={() => setShowUserForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 font-medium">
                <th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 pr-4 font-medium">{u.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-2 pr-4"><span className="badge bg-amber-100 text-amber-800 capitalize">{u.role}</span></td>
                  <td className="py-2 pr-4">
                    <span className={`badge ${u.is_active ? 'badge-success' : 'bg-gray-100 text-gray-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2">
                    <button onClick={() => toggleUserActive(u.id, u.is_active)}
                      className="text-xs text-blue-600 hover:underline">
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <div>
            <h3 className="font-semibold mb-3">Change Your Password</h3>
            <form onSubmit={changePassword} className="space-y-3 max-w-sm">
              {[
                ['currentPassword', 'Current Password'],
                ['newPassword', 'New Password'],
                ['confirmPassword', 'Confirm New Password'],
              ].map(([key, label]) => (
                <FieldRow key={key} label={label}>
                  <input type="password" value={pwForm[key as keyof typeof pwForm]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} className={inputCls} required />
                </FieldRow>
              ))}
              <button type="submit" className="btn-primary">Change Password</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Tab 6: Backup & Data ── */}
      {tab === 'backup' && (
        <div className="card space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-1">Create Backup</h2>
            <p className="text-sm text-gray-500 mb-3">Save a full backup of your store data. Store it safely.</p>
            <button onClick={createBackup} disabled={backupLoading} className="btn-primary">
              {backupLoading ? 'Creating backup…' : '💾 Create Backup Now'}
            </button>
          </div>
          <div>
            <h2 className="font-semibold mb-3">Recent Backups</h2>
            {backups.length === 0 ? (
              <p className="text-sm text-gray-400">No backups found. Create your first backup above.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 font-medium">
                    <th className="pb-2 pr-4">File</th><th className="pb-2 pr-4">Size</th>
                    <th className="pb-2 pr-4">Created</th><th className="pb-2">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.slice(0, 10).map((b: any) => (
                    <tr key={b.filename} className="border-b">
                      <td className="py-2 pr-4 font-mono text-xs">{b.filename}</td>
                      <td className="py-2 pr-4">{(b.size / 1024).toFixed(1)} KB</td>
                      <td className="py-2 pr-4 text-xs">{new Date(b.created_at).toLocaleString('en-IN')}</td>
                      <td className="py-2">
                        <button onClick={() => downloadBackup(b.filename)} className="text-xs text-blue-600 hover:underline">
                          ⬇ Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Auto-backup:</strong> Daily backup runs at 11 PM and saves to{' '}
            <code className="font-mono text-xs bg-amber-100 px-1 rounded">~/ShrigarJewellers/backups/</code>.
            Last 30 backups are retained automatically.
          </div>
          <div className="text-sm text-gray-500">Data Retention: <span className="font-medium">30 days</span></div>
        </div>
      )}

      {/* ── Tab 7: Appearance ── */}
      {tab === 'appearance' && (
        <div className="card space-y-6">
          <h2 className="font-semibold text-lg">Appearance</h2>
          <div className="space-y-4">
            <FieldRow label="Color Theme">
              <div className="flex gap-3 mt-1">
                {['light', 'dark'].map(t => (
                  <button key={t} onClick={() => setTheme(t as 'light' | 'dark')}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${theme === t ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Accent Color">
              <div className="flex gap-2 mt-1">
                {[
                  { name: 'amber', bg: 'bg-amber-500' },
                  { name: 'blue', bg: 'bg-blue-500' },
                  { name: 'green', bg: 'bg-green-500' },
                  { name: 'red', bg: 'bg-red-500' },
                ].map(({ name, bg }) => (
                  <button key={name} onClick={() => set('accent_color', name)}
                    className={`w-8 h-8 rounded-full ${bg} border-2 transition-all ${settings.accent_color === name ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    title={name} />
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Font Size">
              <div className="flex gap-2 mt-1">
                {['normal', 'large', 'xlarge'].map(size => (
                  <button key={size} onClick={() => set('font_size', size)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium capitalize transition-colors ${settings.font_size === size ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {size === 'xlarge' ? 'Extra Large' : size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Layout Density">
              <div className="flex gap-2 mt-1">
                {['compact', 'comfortable', 'spacious'].map(density => (
                  <button key={density} onClick={() => set('layout_density', density)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium capitalize transition-colors ${settings.layout_density === density ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {density.charAt(0).toUpperCase() + density.slice(1)}
                  </button>
                ))}
              </div>
            </FieldRow>
          </div>
          <button onClick={saveSettings} className="btn-primary">Save Appearance</button>
        </div>
      )}
    </div>
  );
}
