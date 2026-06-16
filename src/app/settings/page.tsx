'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/services/db';
import { Lock, KeyRound, LogOut } from 'lucide-react';
import type { BusinessSettings } from '@/types/models';

export default function SettingsPage() {
  const { settings, loadAllData } = useApp();
  const { changePin, logout } = useAuth();
  const [form, setForm] = useState<BusinessSettings | null>(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try { await db.updateSettings(form); alert('Configuración guardada.'); await loadAllData(); }
    catch (err) { console.error(err); }
  };

  const handleChangePin = () => {
    setPinError('');
    setPinSuccess(false);
    if (!oldPin || !newPin || !confirmPin) { setPinError('Complete todos los campos'); return; }
    if (newPin.length < 4) { setPinError('El nuevo PIN debe tener al menos 4 dígitos'); return; }
    if (newPin !== confirmPin) { setPinError('Los PINs nuevos no coinciden'); return; }
    if (oldPin === newPin) { setPinError('El nuevo PIN debe ser diferente al actual'); return; }
    if (changePin(oldPin, newPin)) {
      setPinSuccess(true);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setShowPinModal(false), 1500);
    } else {
      setPinError('PIN actual incorrecto');
    }
  };

  if (!form) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

      {/* Security Section */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} /> Seguridad
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => { setShowPinModal(true); setPinSuccess(false); setPinError(''); }}>
            <KeyRound size={16} /> Cambiar PIN de acceso
          </button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start', color: 'var(--crimson, #EF4444)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={logout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* PIN Change Modal */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-content" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <h4 style={{ marginBottom: '1.25rem', fontWeight: 600 }}>Cambiar PIN de acceso</h4>

            {pinSuccess ? (
              <p style={{ color: 'var(--emerald, #22C55E)', textAlign: 'center', padding: '1rem' }}>¡PIN actualizado correctamente!</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>PIN actual</label>
                    <input type="password" className="form-input" maxLength={4} inputMode="numeric"
                      value={oldPin} onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="form-group">
                    <label>Nuevo PIN</label>
                    <input type="password" className="form-input" maxLength={4} inputMode="numeric"
                      value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <div className="form-group">
                    <label>Confirmar nuevo PIN</label>
                    <input type="password" className="form-input" maxLength={4} inputMode="numeric"
                      value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                {pinError && <p style={{ color: 'var(--crimson, #EF4444)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{pinError}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline" onClick={() => setShowPinModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleChangePin}>Cambiar PIN</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
