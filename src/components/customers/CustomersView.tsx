import { Plus, Edit2 } from 'lucide-react';
import type { Customer } from '../../types/models';

interface CustomersViewProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onAdd: () => void;
}

export function CustomersView({ customers, onEdit, onAdd }: CustomersViewProps) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Directorio de Clientes</h3>
        <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /><span>Agregar Cliente</span></button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>RUC / Cédula</th><th>Razón Social</th><th className="col-hide-mobile">Teléfono</th><th className="col-hide-mobile">Email</th><th className="col-hide-mobile">Dirección</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay clientes registrados.</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.ruc}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="col-hide-mobile">{c.phone || 'S/N'}</td>
                  <td className="col-hide-mobile">{c.email || 'S/E'}</td>
                  <td className="col-hide-mobile">{c.address || 'S/D'}</td>
                  <td style={{ textAlign: 'right' }}><button className="btn btn-secondary btn-icon-only" style={{ padding: '0.4rem' }} onClick={() => onEdit(c)}><Edit2 size={14} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile: native list cards */}
      <div className="native-list">
        {customers.length === 0 ? (
          <div className="native-list-item" style={{ justifyContent: 'center', cursor: 'default' }}>
            <span style={{ color: 'var(--text-3)' }}>No hay clientes registrados.</span>
          </div>
        ) : (
          customers.map(c => (
            <div key={c.id} className="native-list-item" onClick={() => onEdit(c)}>
              <div className="native-list-icon">
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                  {c.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="native-list-body">
                <div className="native-list-title">{c.name}</div>
                <div className="native-list-subtitle">
                  RUC: {c.ruc}
                  {c.phone ? ` · ${c.phone}` : ''}
                </div>
              </div>
              <div className="native-list-end">
                <svg className="native-list-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
