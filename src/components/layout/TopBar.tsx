import { RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/db';

interface TopBarProps {
  activeTab: string;
  loading: boolean;
  onHamburgerClick: () => void;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  pos: 'Punto de Venta',
  inventory: 'Inventario',
  sales: 'Ventas e IVA',
  customers: 'Clientes',
  settings: 'Configuración',
};

export function TopBar({ activeTab, loading, onHamburgerClick }: TopBarProps) {
  const title = pageTitles[activeTab] || '';

  return (
    <header className="top-bar">
      <button className="hamburger-btn" onClick={onHamburgerClick} aria-label="Abrir menú">
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>☰</span>
      </button>

      <div className="page-title">
        <h1>{title}</h1>
      </div>

      <div className="conn-status" style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: isSupabaseConfigured ? 'var(--emerald)' : 'var(--text-3)',
        boxShadow: isSupabaseConfigured ? '0 0 8px var(--emerald-glow)' : 'none',
        flexShrink: 0,
      }} />

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-color)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span style={{ display: 'none' }}>Procesando...</span>
        </div>
      )}
    </header>
  );
}
