'use client';

import { useState } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { db } from '@/services/db';
import { CustomersView } from '@/components/customers/CustomersView';
import type { Customer } from '@/types/models';

export default function CustomersPage() {
  const { customers, loadAllData } = useApp();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({ ruc: '', name: '', phone: '', email: '', address: '' });

  const handleEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust); setCustomerForm({ ruc: cust.ruc, name: cust.name, phone: cust.phone || '', email: cust.email || '', address: cust.address || '' });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await db.saveCustomer({ ...customerForm, id: editingCustomer?.id }); setIsCustomerModalOpen(false); setEditingCustomer(null); setCustomerForm({ ruc: '', name: '', phone: '', email: '', address: '' }); await loadAllData(); }
    catch (err) { console.error(err); }
  };

  const handleDeleteCustomer = async (cust: Customer) => {
    if (!confirm(`¿Eliminar al cliente "${cust.name}" (${cust.ruc})?`)) return;
    try { await db.deleteCustomer(cust.id); await loadAllData(); }
    catch (err) { console.error(err); }
  };

  return (
    <>
      <CustomersView
        customers={customers}
        onEdit={handleEditCustomer}
        onAdd={() => { setEditingCustomer(null); setCustomerForm({ ruc: '', name: '', phone: '', email: '', address: '' }); setIsCustomerModalOpen(true); }}
        onDelete={handleDeleteCustomer}
      />

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3 className="modal-title">{editingCustomer ? 'Editar Cliente' : 'Registrar Cliente'}</h3><button className="modal-close" onClick={() => setIsCustomerModalOpen(false)}>×</button></div>
            <form onSubmit={handleSaveCustomer}>
              <div className="form-group"><label>RUC / Cédula</label><input type="text" className="form-input" placeholder="ej. 80012345-6" value={customerForm.ruc} onChange={(e) => setCustomerForm({ ...customerForm, ruc: e.target.value })} required /></div>
              <div className="form-group"><label>Razón Social</label><input type="text" className="form-input" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required /></div>
              <div className="form-group"><label>Teléfono</label><input type="text" className="form-input" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input type="email" className="form-input" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} /></div>
              <div className="form-group"><label>Dirección</label><input type="text" className="form-input" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsCustomerModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
