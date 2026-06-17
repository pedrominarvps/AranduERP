import { Loader2 } from 'lucide-react';
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--amber)', fontWeight: 500 }}>
            <Loader2 className="animate-spin" size={15} />
            <span>Cargando...</span>
          </div>
        )}

        <div className="conn-status" style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: isSupabaseConfigured ? 'var(--emerald)' : 'var(--text-3)',
          boxShadow: isSupabaseConfigured ? '0 0 8px var(--emerald-glow)' : 'none',
          flexShrink: 0,
        }} />
      </div>
    </header>
  );
}
