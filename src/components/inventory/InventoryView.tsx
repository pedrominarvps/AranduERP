import { Plus, Edit2, Trash2, Tag, Package } from 'lucide-react';
import type { Product, Category } from '../../types/models';
import { formatPYG } from '../../utils/currency';
import { Badge } from '../ui/Badge';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onManageCategories: () => void;
}

export function InventoryView({ products, categories, onEdit, onDelete, onAdd, onManageCategories }: InventoryViewProps) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Listado de Productos</h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onManageCategories}><Tag size={16} /><span>Gestionar Categorías</span></button>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /><span>Agregar Producto</span></button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>Cód. Barra</th><th>Nombre Producto</th><th className="col-hide-mobile">Categoría</th><th className="col-hide-mobile">Costo</th><th>Venta</th><th className="col-hide-mobile">IVA</th><th>Stock</th><th className="col-hide-mobile">Alerta Mín.</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>No hay productos registrados.</td></tr>
            ) : (
              products.map(p => {
                const catName = categories.find(c => c.id === p.category_id)?.name || 'Sin Categoría';
                const isStockCritical = p.stock <= p.min_stock;
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.barcode || 'S/C'}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="col-hide-mobile"><Badge variant="info">{catName}</Badge></td>
                    <td className="col-hide-mobile" style={{ fontFamily: 'var(--font-mono)' }}>{formatPYG(p.cost_price)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatPYG(p.sale_price)}</td>
                    <td className="col-hide-mobile">{p.tax_rate}%</td>
                    <td><Badge variant={isStockCritical ? 'danger' : 'success'}>{p.stock}</Badge></td>
                    <td className="col-hide-mobile" style={{ fontFamily: 'var(--font-mono)' }}>{p.min_stock}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.4rem' }} onClick={() => onEdit(p)}><Edit2 size={14} /></button>
                        <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.4rem' }} onClick={() => onDelete(p.id)}><Trash2 size={14} style={{ color: 'var(--danger-color)' }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile: native list cards */}
      <div className="native-list">
        {products.length === 0 ? (
          <div className="native-list-item" style={{ justifyContent: 'center', cursor: 'default' }}>
            <span style={{ color: 'var(--text-3)' }}>No hay productos registrados.</span>
          </div>
        ) : (
          products.map(p => {
            const catName = categories.find(c => c.id === p.category_id)?.name || 'Sin Categoría';
            const isStockCritical = p.stock <= p.min_stock;
            return (
              <div key={p.id} className="native-list-item" onClick={() => onEdit(p)}>
                <div className="native-list-icon"><Package size={20} /></div>
                <div className="native-list-body">
                  <div className="native-list-title">{p.name}</div>
                  <div className="native-list-subtitle">
                    {p.barcode || 'S/C'} · {catName} · {p.tax_rate}%
                  </div>
                </div>
                <div className="native-list-end">
                  <div className="native-list-badge" style={{ color: 'var(--success-color)' }}>
                    {formatPYG(p.sale_price)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                    <span className={`badge ${isStockCritical ? 'badge-danger' : 'badge-success'}`}
                      style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}>
                      Stock: {p.stock}
                    </span>
                    <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.25rem', width: '28px', height: '28px' }}
                      onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
