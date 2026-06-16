'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { db } from '@/services/db';
import type { BusinessSettings } from '@/types/models';

export default function SettingsPage() {
  const { settings, loadAllData } = useApp();
  const [form, setForm] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try { await db.updateSettings(form); alert('Configuración guardada.'); await loadAllData(); }
    catch (err) { console.error(err); }
  };

  if (!form) return null;

  return (
    <div className="card">
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Parámetros Fiscales del Emisor</h3>
      <form onSubmit={handleSaveSettings}>
        <div className="settings-form-grid">
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Datos de la Razón Social</h4>
            <div className="form-group"><label>Razón Social Emisor</label><input type="text" className="form-input" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required /></div>
            <div className="form-group"><label>RUC del Comercio</label><input type="text" className="form-input" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} required /></div>
            <div className="form-group"><label>Dirección Comercial</label><input type="text" className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="form-group"><label>Teléfono de Atención</label><input type="text" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Timbrado (SET / DNIT)</h4>
            <div className="form-group"><label>Número de Timbrado Vigente</label><input type="text" className="form-input" value={form.timbrado_number} onChange={(e) => setForm({ ...form, timbrado_number: e.target.value })} maxLength={8} required /></div>
            <div className="settings-inline-group">
              <div className="form-group"><label>Fecha Inicio</label><input type="date" className="form-input" value={form.timbrado_start_date} onChange={(e) => setForm({ ...form, timbrado_start_date: e.target.value })} required /></div>
              <div className="form-group"><label>Fecha Fin</label><input type="date" className="form-input" value={form.timbrado_end_date} onChange={(e) => setForm({ ...form, timbrado_end_date: e.target.value })} required /></div>
            </div>
            <div className="settings-inline-group">
              <div className="form-group"><label>Cód. Establecimiento</label><input type="text" className="form-input" value={form.establishment_code} onChange={(e) => setForm({ ...form, establishment_code: e.target.value })} maxLength={3} required /></div>
              <div className="form-group"><label>Punto de Expedición</label><input type="text" className="form-input" value={form.point_of_sale_code} onChange={(e) => setForm({ ...form, point_of_sale_code: e.target.value })} maxLength={3} required /></div>
              <div className="form-group"><label>Siguiente Nro Factura</label><input type="number" className="form-input" value={form.current_invoice_sequence} onChange={(e) => setForm({ ...form, current_invoice_sequence: parseInt(e.target.value as any) || 1 })} required /></div>
            </div>
            <div className="form-group"><label>Pie de Página del Ticket</label><textarea className="form-input" style={{ height: '70px', resize: 'none' }} value={form.receipt_footer} onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })} /></div>
          </div>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary">Guardar Ajustes</button></div>
      </form>
    </div>
  );
}
