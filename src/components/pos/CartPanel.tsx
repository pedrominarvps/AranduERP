import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, X, ChevronUp, ChevronDown, User } from 'lucide-react';
import type { CartItem, Customer } from '../../types/models';
import type { ReceiptType, PaymentMethod } from '../../types/enums';
import { formatPYG, calculateCartTotal } from '../../utils/currency';

interface CartPanelProps {
  cart: CartItem[];
  customers: Customer[];
  selectedCustomerId: string;
  posReceiptType: ReceiptType;
  posPaymentMethod: PaymentMethod;
  onCustomerChange: (id: string) => void;
  onReceiptTypeChange: (type: ReceiptType) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onUpdateQty: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onAddCustomer: () => void;
}

export function CartPanel({
  cart, customers, selectedCustomerId, posReceiptType, posPaymentMethod,
  onCustomerChange, onReceiptTypeChange, onPaymentMethodChange,
  onUpdateQty, onRemoveItem, onClearCart, onCheckout, onAddCustomer,
}: CartPanelProps) {
  const [isMobileExpanded, setMobileExpanded] = useState(false);
  const [isCustomerOpen, setCustomerOpen] = useState(false);
  const totals = calculateCartTotal(cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const renderCartItems = () => (
    <div className="pos-cart-items">
      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <ShoppingCart size={48} />
          <p>Carrito vacío</p>
          <p className="hint">Seleccione productos de la grilla o escanee con su lector</p>
        </div>
      ) : (
        cart.map(item => (
          <div className="cart-item" key={item.id}>
            <div className="cart-item-info">
              <div className="cart-item-title">{item.name}</div>
              <div className="cart-item-price">{formatPYG(item.sale_price)} <span>({item.tax_rate}%)</span></div>
            </div>
            <div className="cart-item-qty">
              <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>-</button>
              <span className="qty-value">{item.quantity}</span>
              <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
            </div>
            <div className="cart-item-subtotal">{formatPYG(item.sale_price * item.quantity)}</div>
            <button className="cart-item-remove" onClick={() => onRemoveItem(item.id)}>
              <X size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  );

  const renderCustomerSection = () => (
    <div className="cart-customer-section">
      <div className="cart-customer-header" onClick={() => setCustomerOpen(!isCustomerOpen)}>
        <User size={16} />
        {selectedCustomer ? (
          <span className="customer-name">{selectedCustomer.name}</span>
        ) : (
          <span style={{ flex: 1, color: 'var(--text-2)' }}>Seleccionar cliente</span>
        )}
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={(e) => { e.stopPropagation(); onAddCustomer(); }}>+</button>
        {isCustomerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {isCustomerOpen && (
        <div className="cart-customer-details">
          <div className="customer-field">
            <label>RUC / Razón Social</label>
            <select className="pos-customer-select" value={selectedCustomerId} onChange={(e) => onCustomerChange(e.target.value)}>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.ruc} - {c.name}</option>
              ))}
            </select>
          </div>
          {selectedCustomer && (
            <>
              <div className="customer-field">
                <label>Dirección</label>
                <div className="customer-value">{selectedCustomer.address || 'S/D'}</div>
              </div>
              <div className="customer-field">
                <label>Teléfono</label>
                <div className="customer-value">{selectedCustomer.phone || 'S/N'}</div>
              </div>
            </>
          )}
          <div className="cart-receipt-payment">
            <select value={posReceiptType} onChange={(e) => onReceiptTypeChange(e.target.value as ReceiptType)}>
              <option value="ticket">Ticket 80mm</option>
              <option value="factura">Factura A4</option>
            </select>
            <select value={posPaymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  const renderSummary = () => (
    <div className="pos-cart-summary">
      <div className="summary-row"><span>Subtotal Exento</span><span>{formatPYG(totals.subtotalExempt)}</span></div>
      <div className="summary-row"><span>Subtotal 5%</span><span>{formatPYG(totals.subtotal5)}</span></div>
      <div className="summary-row"><span>Subtotal 10%</span><span>{formatPYG(totals.subtotal10)}</span></div>
      <div className="summary-row" style={{ fontStyle: 'italic' }}><span>IVA Liquidado (SET)</span><span>{formatPYG(totals.total_iva)}</span></div>
      <div className="summary-row total"><span>TOTAL A PAGAR</span><span>{formatPYG(totals.total)}</span></div>
      <div className="checkout-grid">
        <button className="btn btn-secondary" onClick={onClearCart} disabled={cart.length === 0}>Cancelar</button>
        <button className="btn btn-primary" onClick={onCheckout} disabled={cart.length === 0}>Cobrar</button>
      </div>
    </div>
  );

  return (
    <>
      {/* ===== MOBILE FLOATING BAR ===== */}
      <div className="mobile-cart-bar">
        <div className="mobile-cart-bar-inner">
          <div className="mobile-cart-bar-left" onClick={() => { if (cart.length > 0) setMobileExpanded(true); }}>
            <div className="mobile-cart-bar-icon">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
            </div>
            <div className="mobile-cart-bar-info">
              <span className="mobile-cart-bar-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
              <span className="mobile-cart-bar-total">{formatPYG(totals.total)}</span>
            </div>
          </div>
          <button className="mobile-cart-checkout-btn" onClick={onCheckout} disabled={cart.length === 0}>
            Cobrar
          </button>
          <button className="mobile-cart-toggle" onClick={() => { if (cart.length > 0) setMobileExpanded(!isMobileExpanded); }}>
            {isMobileExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE EXPANDED CART ===== */}
      {isMobileExpanded && (
        <div className="mobile-cart-overlay" onClick={() => setMobileExpanded(false)}>
          <div className="mobile-cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-cart-header">
              <button className="mobile-cart-back" onClick={() => setMobileExpanded(false)}>
                <X size={18} />
              </button>
              <h3>Carrito</h3>
              {cart.length > 0 && (
                <button className="btn btn-secondary btn-icon-only" onClick={onClearCart} style={{ padding: '0.35rem' }}>
                  <Trash2 size={15} style={{ color: 'var(--crimson)' }} />
                </button>
              )}
            </div>
            <div className="mobile-cart-body">
              {renderCustomerSection()}
              {renderCartItems()}
            </div>
            <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              {renderSummary()}
            </div>
          </div>
        </div>
      )}

      {/* ===== DESKTOP CART PANEL ===== */}
      <div className="desktop-cart-panel">
        <div className="pos-cart-panel">
          <div>
            <div className="pos-cart-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Carrito de Compra</h3>
              {cart.length > 0 && (
                <button className="btn btn-secondary btn-icon-only" onClick={onClearCart}>
                  <Trash2 size={16} style={{ color: 'var(--crimson)' }} />
                </button>
              )}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                RUC / Razón Social Cliente
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="pos-customer-select" value={selectedCustomerId} onChange={(e) => onCustomerChange(e.target.value)}>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.ruc} - {c.name}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-icon-only" onClick={onAddCustomer} title="Agregar nuevo cliente">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Comprobante</label>
                <select className="form-input" style={{ padding: '0.5rem' }} value={posReceiptType} onChange={(e) => onReceiptTypeChange(e.target.value as ReceiptType)}>
                  <option value="ticket">Ticket Térmico (80mm)</option>
                  <option value="factura">Factura Legal A4</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Medio de Pago</label>
                <select className="form-input" style={{ padding: '0.5rem' }} value={posPaymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                </select>
              </div>
            </div>
          </div>
          {renderCartItems()}
          {renderSummary()}
        </div>
      </div>
    </>
  );
}
