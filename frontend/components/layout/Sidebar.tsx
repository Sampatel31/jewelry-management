'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { LayoutDashboard, Package, Factory, Receipt, Monitor, Users, ShoppingCart, Wrench, BarChart3, Settings, LogOut, ClipboardList, Coins, Sun, Moon } from 'lucide-react';
import { logout, getUser } from '@/lib/auth';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from './Logo';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: null },
  { href: '/inventory', icon: Package, label: 'Inventory', roles: null },
  { href: '/production', icon: Factory, label: 'Production', roles: null },
  { href: '/billing', icon: Receipt, label: 'Billing', roles: null },
  { href: '/pos', icon: Monitor, label: 'POS', roles: ['admin', 'manager', 'staff'] },
  { href: '/customers', icon: Users, label: 'Customers', roles: null },
  { href: '/purchases', icon: ShoppingCart, label: 'Purchases', roles: null },
  { href: '/repairs', icon: Wrench, label: 'Repairs', roles: null },
  { href: '/old-gold', icon: Coins, label: 'Old Gold', roles: ['admin', 'manager', 'staff'] },
  { href: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager', 'accountant'] },
  { href: '/audit-logs', icon: ClipboardList, label: 'Audit Logs', roles: ['admin', 'accountant'] },
  { href: '/settings', icon: Settings, label: 'Settings', roles: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();
  const role = user?.role || '';
  const { theme, toggleTheme } = useTheme();

  const visibleItems = useMemo(
    () => navItems.filter(item => !item.roles || item.roles.includes(role)),
    [role]
  );

  return (
    <aside className="h-screen w-60 bg-dark flex flex-col fixed left-0 top-0 z-40 shadow-2xl">
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`sidebar-link ${pathname.startsWith(href) ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-1">
        <button
          onClick={toggleTheme}
          className="sidebar-link w-full text-left text-gray-300 hover:text-white"
          title="Toggle dark/light mode"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={logout} className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-400/10">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
