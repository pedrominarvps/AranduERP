import { LayoutDashboard, ShoppingCart, Package, Receipt, Users, Settings, Sun, Moon } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/db';
import type { TabName } from '../../types/enums';

interface SidebarProps {
  activeTab: TabName;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  onTabChange: (tab: TabName) => void;
  onToggleTheme: () => void;
}

const menuItems: { tab: TabName; icon: typeof LayoutDashboard; label: string }[] = [
  { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { tab: 'pos', icon: ShoppingCart, label: 'Punto de Venta' },
  { tab: 'inventory', icon: Package, label: 'Inventario' },
  { tab: 'sales', icon: Receipt, label: 'Ventas e IVA' },
  { tab: 'customers', icon: Users, label: 'Clientes' },
  { tab: 'settings', icon: Settings, label: 'Configuración' },
];

export function Sidebar({ activeTab, isDarkMode, isSidebarOpen, onTabChange, onToggleTheme }: SidebarProps) {
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div>
        <div className="logo-section">
          <img src="/logo.png" alt="Arandu ERP" className="sidebar-logo-img" />
          <div className="logo-text">
            Arandu ERP
            <span>Paraguay · ERP</span>
          </div>
        </div>

        <ul className="menu-list">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li
                key={item.tab}
                className={`menu-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => onTabChange(item.tab)}
              >
                <Icon className="menu-item-icon" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: isSupabaseConfigured ? 'var(--success-color)' : 'var(--text-muted)',
            boxShadow: isSupabaseConfigured ? '0 0 8px var(--success-color)' : 'none',
          }} />
          <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Offline (Local)'}</span>
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onToggleTheme}>
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDarkMode ? 'Tema Claro' : 'Tema Oscuro'}</span>
        </button>
      </div>
    </aside>
  );
}
