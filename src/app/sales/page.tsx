'use client';

import { useState } from 'react';
import { Printer, FileText, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/contexts/AppContext';
import { db } from '@/services/db';
import { formatPYG } from '@/utils/currency';
import { SalesView } from '@/components/sales/SalesView';
import type { Sale } from '@/types/models';

export default function SalesPage() {
  const { sales, settings, loadAllData, setPrintPayload } = useApp();

  const [isSaleDetailModalOpen, setIsSaleDetailModalOpen] = useState(false);
  const [activeSaleDetail, setActiveSaleDetail] = useState<Sale | null>(null);
  const [activeSaleItems, setActiveSaleItems] = useState<any[]>([]);

  const handleViewSaleDetails = async (sale: Sale) => {
    try { const items = await db.getSaleDetails(sale.id); setActiveSaleDetail(sale); setActiveSaleItems(items); setIsSaleDetailModalOpen(true); }
    catch (err) { console.error(err); }
  };

  const handleReprintSale = async (sale: Sale, type: 'ticket' | 'factura') => {
    try {
      const items = await db.getSaleDetails(sale.id);
      setPrintPayload({ sale, items, settings, type });
      setTimeout(() => window.print(), 500);
    } catch (err) { console.error(err); }
  };

  const handleDeleteSale = async (sale: Sale) => {
    const confirmDelete = window.confirm(
      `¿Está seguro de que desea eliminar la venta Nro: ${sale.invoice_number}? Esta acción no se puede deshacer y restablecerá el stock.`
    );
    if (!confirmDelete) return;

    try {
      const success = await db.deleteSale(sale.id);
      if (success) {
        alert('Venta eliminada correctamente.');
        await loadAllData();
      } else {
        alert('No se pudo encontrar la venta a eliminar.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al intentar eliminar la venta.');
    }
  };

  return (
    <>
      <SalesView sales={sales} onViewDetails={handleViewSaleDetails} onReprint={handleReprintSale} onDelete={handleDeleteSale} />

      {/* Sale Detail Modal */}
      {isSaleDetailModalOpen && activeSaleDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div><h3 className="modal-title">Venta Nro: {activeSaleDetail.invoice_number}</h3><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(activeSaleDetail.created_at).toLocaleString('es-PY')}</span></div>
              <button className="modal-close" onClick={() => setIsSaleDetailModalOpen(false)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div><strong style={{ color: 'var(--accent-color)' }}>Timbrado:</strong><div>Nro: {activeSaleDetail.timbrado}</div></div>
              <div><strong style={{ color: 'var(--accent-color)' }}>Cliente:</strong><div>{activeSaleDetail.customer_name}</div><div>RUC: {activeSaleDetail.customer_ruc}</div></div>
            </div>
            <div className="table-container" style={{ marginBottom: '1.5rem' }}>
              <table className="data-table">
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio Unit.</th><th>IVA</th><th style={{ textAlign: 'right' }}>Subtotal</th></tr></thead>
                <tbody>{activeSaleItems.map((item, idx) => (
                  <tr key={idx}><td style={{ fontWeight: 600 }}>{item.product_name}</td><td>{item.quantity}</td><td style={{ fontFamily: 'var(--font-mono)' }}>{formatPYG(item.unit_price)}</td><td>{item.tax_rate}%</td><td style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 600 }}>{formatPYG(item.subtotal)}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <div><strong>Exenta:</strong><div>{formatPYG(Number(activeSaleDetail.total_exempt))}</div></div>
                <div><strong>Grav. 5%:</strong><div>{formatPYG(Math.round(Number(activeSaleDetail.total_iva_5) * 21))}</div></div>
                <div><strong>Grav. 10%:</strong><div>{formatPYG(Math.round(Number(activeSaleDetail.total_iva_10) * 11))}</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                <span>Total:</span><span>{formatPYG(Number(activeSaleDetail.total))}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ flex: '1 1 100%' }} onClick={() => setIsSaleDetailModalOpen(false)}>Cerrar</button>
              <button className="btn btn-primary" style={{ flex: '1 1 45%', gap: '0.5rem', justifyContent: 'center' }} onClick={() => { handleReprintSale(activeSaleDetail, 'ticket'); setIsSaleDetailModalOpen(false); }}>
                <Printer size={16} /><span>Ticket 80mm</span>
              </button>
              <button className="btn btn-primary" style={{ flex: '1 1 45%', gap: '0.5rem', justifyContent: 'center', background: 'var(--accent-glow, #3B82F6)', borderColor: 'var(--accent-glow, #3B82F6)', color: '#fff' }} onClick={() => { handleReprintSale(activeSaleDetail, 'factura'); setIsSaleDetailModalOpen(false); }}>
                <FileText size={16} /><span>Factura A4</span>
              </button>
              <button className="btn" style={{ flex: '1 1 100%', gap: '0.5rem', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--crimson, #EF4444)', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }} onClick={() => { handleDeleteSale(activeSaleDetail); setIsSaleDetailModalOpen(false); }}>
                <Trash2 size={16} /><span>Eliminar Venta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
