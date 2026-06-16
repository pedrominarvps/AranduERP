import { Search, Printer, Receipt } from 'lucide-react';
import type { Sale } from '../../types/models';
import { formatPYG } from '../../utils/currency';
import { Badge } from '../ui/Badge';

interface SalesViewProps {
  sales: Sale[];
  onViewDetails: (sale: Sale) => void;
  onReprint: (sale: Sale) => void;
}

export function SalesView({ sales, onViewDetails, onReprint }: SalesViewProps) {
  return (
    <div className="card">
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Registro de Facturación Emitida</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>Fecha / Hora</th><th>Factura Nro.</th><th className="col-hide-mobile">Timbrado</th><th>Cliente</th><th>Total Facturado</th><th className="col-hide-mobile">IVA 5%</th><th className="col-hide-mobile">IVA 10%</th><th className="col-hide-mobile">Exento</th><th className="col-hide-mobile">Método</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>No hay ventas registradas.</td></tr>
            ) : (
              sales.map(s => (
                <tr key={s.id}>
                  <td>{new Date(s.created_at).toLocaleString('es-PY')}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.invoice_number}</td>
                  <td className="col-hide-mobile" style={{ fontFamily: 'var(--font-mono)' }}>{s.timbrado}</td>
                  <td><div>{s.customer_name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RUC: {s.customer_ruc}</div></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success-color)' }}>{formatPYG(Number(s.total))}</td>
                  <td className="col-hide-mobile" style={{ fontFamily: 'var(--font-mono)' }}>{formatPYG(Number(s.total_iva_5))}</td>
                  <td className="col-hide-mobile" style={{ fontFamily: 'var(--font-mono)' }}>{formatPYG(Number(s.total_iva_10))}</td>
                  <td className="col-hide-mobile" style={{ fontFamily: 'var(--font-mono)' }}>{formatPYG(Number(s.total_exempt))}</td>
                  <td className="col-hide-mobile"><Badge variant="info">{s.payment_method}</Badge></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.4rem' }} onClick={() => onViewDetails(s)} title="Ver detalle"><Search size={14} /></button>
                      <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.4rem' }} onClick={() => onReprint(s)} title="Reimprimir"><Printer size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile: native list cards */}
      <div className="native-list">
        {sales.length === 0 ? (
          <div className="native-list-item" style={{ justifyContent: 'center', cursor: 'default' }}>
            <span style={{ color: 'var(--text-3)' }}>No hay ventas registradas.</span>
          </div>
        ) : (
          sales.map(s => (
            <div key={s.id} className="native-list-item" onClick={() => onViewDetails(s)}>
              <div className="native-list-icon"><Receipt size={20} /></div>
              <div className="native-list-body">
                <div className="native-list-title">{s.invoice_number}</div>
                <div className="native-list-subtitle">
                  {new Date(s.created_at).toLocaleString('es-PY')}
                </div>
              </div>
              <div className="native-list-end">
                <div className="native-list-badge" style={{ color: 'var(--success-color)' }}>
                  {formatPYG(Number(s.total))}
                </div>
                <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.25rem', width: '28px', height: '28px' }}
                  onClick={(e) => { e.stopPropagation(); onReprint(s); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
