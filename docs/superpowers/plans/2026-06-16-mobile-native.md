# Mobile Native Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile overflow and apply native-app design (iOS tab bar, native list cards, bottom sheets)

**Architecture:** Pure CSS + minor component changes. No new state or data flow. Mobile visibility toggled via CSS `@media` queries. Native list items rendered alongside existing tables, shown/hidden per breakpoint.

**Tech Stack:** React 19, Next.js App Router, CSS custom properties, lucide-react icons

---

### Task 1: Fix horizontal overflow + box-sizing

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Add overflow guards and box-sizing**

Add at root level (near `:root` block):
```css
*, *::before, *::after { box-sizing: border-box; }

html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

.app-container { overflow-x: hidden; }
```

- [ ] **Fix `.main-content` mobile width**

In the `@media (max-width: 767px)` section, update `.main-content`:
```css
.main-content {
  margin-left: 0;
  padding: 0.75rem;
  padding-bottom: 5rem;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}
```

- [ ] **Fix `.cart-item-subtotal` min-width for mobile**

```css
.cart-item-subtotal { min-width: 80px; }

@media (max-width: 767px) {
  .cart-item-subtotal { min-width: auto; }
}
```

---

### Task 2: Fix sidebar-open class on main content

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Add conditional sidebar-open class to `<main>`**

Change line 32 from:
```tsx
<main className="main-content">
```
to:
```tsx
<main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
```

---

### Task 3: iOS-style tab bar

**Files:**
- Modify: `src/components/layout/MobileNav.tsx`
- Modify: `src/app/globals.css`

- [ ] **Rewrite MobileNav.tsx with 5 tabs + "More" menu**

Full file content:
```tsx
import { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Settings, Users, MoreHorizontal } from 'lucide-react';
import type { TabName } from '../../types/enums';

interface MobileNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const mainTabs: { tab: TabName; icon: typeof LayoutDashboard; label: string }[] = [
  { tab: 'pos', icon: ShoppingCart, label: 'POS' },
  { tab: 'sales', icon: Receipt, label: 'Ventas' },
  { tab: 'inventory', icon: Package, label: 'Stock' },
  { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { tab: 'settings', icon: Settings, label: 'Ajustes' },
];

const overflowTabs: { tab: TabName; icon: typeof Users; label: string }[] = [
  { tab: 'customers', icon: Users, label: 'Clientes' },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showOverflow) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowOverflow(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showOverflow]);

  const handleTab = (tab: TabName) => {
    onTabChange(tab);
    setShowOverflow(false);
  };

  return (
    <nav className="tab-bar-ios">
      {mainTabs.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            className={`tab-bar-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.tab)}
          >
            <Icon className="tab-bar-icon" size={22} />
            <span className="tab-bar-label">{item.label}</span>
          </button>
        );
      })}
      <div className="tab-bar-more-wrapper" ref={menuRef}>
        <button
          className={`tab-bar-item ${showOverflow ? 'active' : ''}`}
          onClick={() => setShowOverflow(!showOverflow)}
        >
          <MoreHorizontal className="tab-bar-icon" size={22} />
          <span className="tab-bar-label">Más</span>
        </button>
        {showOverflow && (
          <div className="tab-bar-overflow-menu">
            {overflowTabs.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  className={`tab-bar-overflow-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTab(item.tab)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Add iOS tab bar CSS at the end of the `@media (max-width: 767px)` section**

```css
/* === iOS Tab Bar === */
.tab-bar-ios {
  display: flex;
  align-items: stretch;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: calc(0.25rem + env(safe-area-inset-bottom, 0px));
  height: auto;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  padding: 0.375rem 0.25rem;
  background: none;
  border: none;
  color: var(--text-3, #64748b);
  cursor: pointer;
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

.tab-bar-item.active {
  color: var(--accent-color, #F59E0B);
}

.tab-bar-icon {
  display: block;
}

.tab-bar-label {
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1;
}

/* More menu */
.tab-bar-more-wrapper {
  flex: 1;
  position: relative;
}

.tab-bar-overflow-menu {
  position: fixed;
  bottom: calc(3.75rem + env(safe-area-inset-bottom, 0px));
  right: 0.75rem;
  background: var(--surface-2, #1E293B);
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 12px;
  padding: 0.25rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  min-width: 160px;
  z-index: 210;
  animation: fadeIn 0.12s ease;
}

.tab-bar-overflow-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: none;
  border: none;
  color: var(--text-1, #F1F5F9);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.12s ease;
}

.tab-bar-overflow-item:hover,
.tab-bar-overflow-item.active {
  background: rgba(245, 158, 11, 0.12);
  color: var(--accent-color, #F59E0B);
}

/* Hide old mobile-nav */
.mobile-nav { display: none !important; }
```

---

### Task 4: Native list cards CSS

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Add native list styles in `@media (max-width: 767px)` section**

```css
/* === Native List Cards === */
.native-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.native-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-1, #1E293B);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.12s ease, transform 0.12s ease;
  -webkit-tap-highlight-color: transparent;
  border: 1px solid var(--border, rgba(255,255,255,0.06));
}

.native-list-item:active {
  background: rgba(255,255,255,0.04);
  transform: scale(0.985);
}

.native-list-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-color, #F59E0B);
  flex-shrink: 0;
}

.native-list-body {
  flex: 1;
  min-width: 0;
}

.native-list-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-1, #F1F5F9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.native-list-subtitle {
  font-size: 0.75rem;
  color: var(--text-3, #64748b);
  margin-top: 0.125rem;
}

.native-list-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
}

.native-list-badge {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-mono), monospace;
}

.native-list-chevron {
  color: var(--text-3, #64748b);
  opacity: 0.5;
}

/* Desktop table hidden on mobile, native list hidden on desktop */
@media (max-width: 767px) {
  .data-table { display: none !important; }
  .table-container { overflow: visible !important; }
}
@media (min-width: 768px) {
  .native-list { display: none !important; }
}
```

---

### Task 5: Add native list items to InventoryView

**Files:**
- Modify: `src/components/inventory/InventoryView.tsx`

- [ ] **Add native list after the table in the card**

Add this block right after the closing `</table>` and its `</div>` (table-container) and before the closing `</div>` (card):

```tsx
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
```

---

### Task 6: Add native list items to SalesView

**Files:**
- Modify: `src/components/sales/SalesView.tsx`

- [ ] **Add native list after the table**

Add this block after the `</table>` and `</div>` (table-container), before `</div>` (card):

```tsx
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
```

---

### Task 7: Add native list items to CustomersView

**Files:**
- Modify: `src/components/customers/CustomersView.tsx`

- [ ] **Add native list after the table**

Add this block after `</table>` and `</div>` (table-container), before `</div>` (card):

```tsx
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
```

---

### Task 8: POS mobile refinements

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Add bottom cart bar improvements in `@media (max-width: 767px)`**

Find `.mobile-cart-bar` and add badge count styling; also ensure category chips scroll horizontally:

```css
/* Category chips scroll */
.category-chips {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.category-chips::-webkit-scrollbar { display: none; }

.category-chip { scroll-snap-align: start; }
```

- [ ] **Add bottom sheet handle bar for modals**

```css
/* Bottom sheet handle */
.modal-handle {
  width: 36px;
  height: 4px;
  border-radius: 4px;
  background: var(--text-3, #64748b);
  opacity: 0.3;
  margin: -0.5rem auto 0.75rem auto;
  display: none;
}

@media (max-width: 767px) {
  .modal-handle { display: block; }
}
```

- [ ] **Add `.mobile-nav` hide override** (already in Task 3, confirm)

---

### Task 9: Verify build

**Files:**
- Run: `npx next build`

- [ ] **Run the production build**

```bash
npx next build
```

Expected: All routes compile, TypeScript passes, no errors.
