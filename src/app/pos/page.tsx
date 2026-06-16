'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { useApp } from '@/lib/contexts/AppContext';
import { db } from '@/services/db';
import { formatPYG, calculateCartTotal } from '@/utils/currency';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import type { Product, CartItem } from '@/types/models';
import type { PaymentMethod, ReceiptType } from '@/types/enums';

export default function PosPage() {
  const { settings, products, categories, customers, loadAllData, setPrintPayload } = useApp();

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posSearch, setPosSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [posReceiptType, setPosReceiptType] = useState<ReceiptType>('ticket');
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  // Customer modal (for "add from POS")
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ ruc: '', name: '', phone: '', email: '', address: '' });

  // Set default customer on load
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      const defaultCust = customers.find(c => c.ruc.includes('44444401'));
      setSelectedCustomerId(defaultCust?.id || customers[0]?.id || '');
    }
  }, [customers, selectedCustomerId]);

  // Calculate change amount
  useEffect(() => {
    const total = calculateCartTotal(cart).total;
    const paid = parseFloat(receivedAmount) || 0;
    setChangeAmount(Math.max(0, paid - total));
  }, [receivedAmount, cart]);

  // --- Cart handlers ---
  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return alert(`Stock insuficiente para "${product.name}".`);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Stock máximo alcanzado para ${product.name} (${product.stock} disponibles).`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const handleUpdateCartQty = useCallback((productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.id !== productId) return item;
      const newQty = item.quantity + change;
      if (newQty <= 0) return null;
      if (product && newQty > product.stock) {
        alert(`Stock máximo alcanzado para ${product.name}.`);
        return item;
      }
      return { ...item, quantity: newQty };
    }).filter(Boolean) as CartItem[]);
  }, [products]);

  const handleRemoveFromCart = useCallback((id: string) => setCart(prev => prev.filter(item => item.id !== id)), []);
  const handleClearCart = useCallback(() => setCart([]), []);

  const handleBarcodeSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!posSearch.trim()) return;
    const found = products.find(p => p.barcode === posSearch.trim());
    if (found) { handleAddToCart(found); setPosSearch(''); }
    else {
      const matches = products.filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase()));
      if (matches.length === 1) { handleAddToCart(matches[0]); setPosSearch(''); }
    }
  }, [posSearch, products, handleAddToCart]);

  // --- Checkout ---
  const handleOpenCheckout = useCallback(() => {
    if (cart.length === 0) return alert('Agregue productos al carrito.');
    setReceivedAmount(calculateCartTotal(cart).total.toString());
    setIsCheckoutModalOpen(true);
  }, [cart]);

  const handleConfirmSale = async () => {
    if (!settings) return;
    const totals = calculateCartTotal(cart);
    const paid = parseFloat(receivedAmount) || 0;
    if (paid < totals.total) return alert(`Monto recibido insuficiente. Total: ${formatPYG(totals.total)}`);
    try {
      const seqStr = settings.current_invoice_sequence.toString().padStart(7, '0');
      const invoiceNumber = `${settings.establishment_code}-${settings.point_of_sale_code}-${seqStr}`;
      const savedSale = await db.saveSale({
        invoice_number: invoiceNumber, timbrado: settings.timbrado_number,
        customer_id: selectedCustomerId, total: totals.total,
        total_iva_5: totals.total_iva_5, total_iva_10: totals.total_iva_10,
        total_exempt: totals.subtotalExempt, payment_method: posPaymentMethod,
        received_amount: paid, change_amount: changeAmount,
      }, cart);
      await loadAllData();
      const customerObj = customers.find(c => c.id === selectedCustomerId) ?? { name: '', ruc: '', address: '', phone: '' };
      setPrintPayload({
        sale: { ...savedSale, customer_name: customerObj.name, customer_ruc: customerObj.ruc, customer_address: customerObj.address, customer_phone: customerObj.phone, created_at: new Date().toISOString() },
        items: cart.map(item => ({ ...item, product_name: item.name, subtotal: item.sale_price * item.quantity })),
        settings, type: posReceiptType,
      });
      setCart([]);
      setIsCheckoutModalOpen(false);
      setTimeout(() => window.print(), 500);
    } catch (err) { console.error(err); alert('Error al procesar venta.'); }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.saveCustomer({ ...customerForm });
      setIsCustomerModalOpen(false);
      setCustomerForm({ ruc: '', name: '', phone: '', email: '', address: '' });
      await loadAllData();
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <div className="pos-container">
        <ProductGrid
          products={products} categories={categories}
          posSearch={posSearch} selectedCategoryId={selectedCategoryId}
          onSearchChange={setPosSearch} onCategoryChange={setSelectedCategoryId}
          onProductSelect={handleAddToCart} onBarcodeSubmit={handleBarcodeSubmit}
          inputRef={barcodeInputRef}
        />
        <CartPanel
          cart={cart} customers={customers} selectedCustomerId={selectedCustomerId}
          posReceiptType={posReceiptType} posPaymentMethod={posPaymentMethod}
          onCustomerChange={setSelectedCustomerId}
          onReceiptTypeChange={setPosReceiptType} onPaymentMethodChange={setPosPaymentMethod}
          onUpdateQty={handleUpdateCartQty} onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart} onCheckout={handleOpenCheckout}
          onAddCustomer={() => { setCustomerForm({ ruc: '', name: '', phone: '', email: '', address: '' }); setIsCustomerModalOpen(true); }}
        />
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Cobro de Transacción</h3>
              <button className="modal-close" onClick={() => setIsCheckoutModalOpen(false)}>×</button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', marginBottom: '1rem' }}>
                <span>Total Venta:</span>
                <strong style={{ color: 'var(--success-color)' }}>{formatPYG(calculateCartTotal(cart).total)}</strong>
              </div>
              <div className="form-group">
                <label>Monto Recibido (Gs.)</label>
                <input type="number" className="form-input" style={{ fontSize: '1.75rem', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 'bold' }} value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} autoFocus />
              </div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Billetes Rápidos (Gs.):</label>
              <div className="cash-calc-grid">
                {[5000, 10000, 20000, 50000, 100000].map(val => (
                  <div key={val} className="cash-chip" onClick={() => { const cur = parseFloat(receivedAmount) || 0; setReceivedAmount((cur === calculateCartTotal(cart).total ? 0 : cur) + val + ''); }}>{val.toLocaleString('es-PY')}</div>
                ))}
                <div className="cash-chip" style={{ background: 'rgba(229,62,90,0.2)', color: 'var(--crimson)' }} onClick={() => setReceivedAmount('')}>Limpiar</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
                <span>Vuelto:</span>
                <span style={{ color: changeAmount > 0 ? 'var(--marigold)' : 'var(--text-1)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{formatPYG(changeAmount)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsCheckoutModalOpen(false)}>Cerrar</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleConfirmSale}><Printer size={18} /><span>Confirmar e Imprimir</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal (quick add from POS) */}
      {isCustomerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3 className="modal-title">Registrar Cliente</h3><button className="modal-close" onClick={() => setIsCustomerModalOpen(false)}>×</button></div>
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
