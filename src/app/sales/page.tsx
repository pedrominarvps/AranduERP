'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
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

  const handleReprintSale = async (sale: Sale) => {
    try {
      const items = await db.getSaleDetails(sale.id);
      setPrintPayload({ sale, items, settings, type: 'ticket' });
      setTimeout(() => window.print(), 500);
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <SalesView sales={sales} onViewDetails={handleViewSaleDetails} onReprint={handleReprintSale} />

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
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsSaleDetailModalOpen(false)}>Cerrar</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { handleReprintSale(activeSaleDetail); setIsSaleDetailModalOpen(false); }}><Printer size={16} /><span>Reimprimir</span></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
