'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Factory, Receipt, Monitor, Users, ShoppingCart, Wrench, BarChart3, Settings, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/production', icon: Factory, label: 'Production' },
  { href: '/billing', icon: Receipt, label: 'Billing' },
  { href: '/pos', icon: Monitor, label: 'POS' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/purchases', icon: ShoppingCart, label: 'Purchases' },
  { href: '/repairs', icon: Wrench, label: 'Repairs' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-60 bg-dark flex flex-col fixed left-0 top-0 z-40 shadow-2xl">
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <span className="text-xl font-bold text-amber-400">JewelMS</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`sidebar-link ${pathname.startsWith(href) ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={logout} className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-400/10">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
