# PostERP Refactor — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reparar el sistema responsive y migrar incrementalmente a TypeScript con componentes modulares.

**Arquitectura:** Fase 1 repara el CSS responsive huérfano (clases en CSS nunca usadas en JSX). Fase 2 migración incremental: types → utils → db → hooks → componentes → App.tsx minimalista.

**Tech Stack:** React 19, Vite 8, TypeScript, CSS Modules (archivo único existente)

---

## Fase 1: Reparación Responsive

### Task 1: Agregar estado de sidebar y estructura HTML faltante

**Files:**
- Modify: `src/App.jsx:1-2006`

- [ ] **Step 1: Agregar estado `isSidebarOpen` y función toggle**

Agregar después de `const [isDarkMode, setIsDarkMode] = useState(true);` (línea 12):

```jsx
const [isSidebarOpen, setSidebarOpen] = useState(false);
```

- [ ] **Step 2: Agregar hamburger button en top-bar**

Buscar el bloque `<header className="top-bar">` (línea 595). Agregar el botón hamburguesa antes del `<div className="page-title">`:

```jsx
<button
  className="hamburger-btn"
  onClick={() => setSidebarOpen(true)}
  aria-label="Abrir menú"
>
  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>☰</span>
</button>
```

- [ ] **Step 3: Agregar sidebar overlay**

Buscar `<aside className="sidebar">` (línea 511). Justo ANTES de esa línea, agregar:

```jsx
{/* Overlay para cerrar sidebar en mobile/tablet */}
<div
  className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
  onClick={() => setSidebarOpen(false)}
/>
```

- [ ] **Step 4: Agregar clase `.open` dinámica al sidebar**

Cambiar `<aside className="sidebar">` por:

```jsx
<aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
```

Y cerrar el sidebar al hacer click en un ítem del menú. En cada `onClick={() => setActiveTab('...')}`, agregar `setSidebarOpen(false)`:

```jsx
onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
onClick={() => { setActiveTab('pos'); setSidebarOpen(false); }}
onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }}
onClick={() => { setActiveTab('sales'); setSidebarOpen(false); }}
onClick={() => { setActiveTab('customers'); setSidebarOpen(false); }}
onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
```

- [ ] **Step 5: Agregar clase `.sidebar-open` dinámica al main-content**

Cambiar `<main className="main-content">` por:

```jsx
<main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
```

- [ ] **Step 6: Agregar navegación inferior móvil (mobile-nav)**

Buscar el cierre de `<main className="main-content">` (antes de la línea 1313 de modales). JUSTO ANTES del `{/* MODAL: CHECKOUT */}` ), agregar:

```jsx
{/* ==========================================
   NAV INFERIOR MÓVIL
   ========================================== */}
<nav className="mobile-nav">
  <button
    className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
    onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
  >
    <LayoutDashboard className="mobile-nav-icon" />
    <span>Dashboard</span>
  </button>
  <button
    className={`mobile-nav-item ${activeTab === 'pos' ? 'active' : ''}`}
    onClick={() => { setActiveTab('pos'); setSidebarOpen(false); }}
  >
    <ShoppingCart className="mobile-nav-icon" />
    <span>POS</span>
  </button>
  <button
    className={`mobile-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
    onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }}
  >
    <Package className="mobile-nav-icon" />
    <span>Stock</span>
  </button>
  <button
    className={`mobile-nav-item ${activeTab === 'sales' ? 'active' : ''}`}
    onClick={() => { setActiveTab('sales'); setSidebarOpen(false); }}
  >
    <Receipt className="mobile-nav-icon" />
    <span>Ventas</span>
  </button>
  <button
    className={`mobile-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
    onClick={() => { setActiveTab('customers'); setSidebarOpen(false); }}
  >
    <Users className="mobile-nav-icon" />
    <span>Clientes</span>
  </button>
  <button
    className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
    onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
  >
    <Settings className="mobile-nav-icon" />
    <span>Ajustes</span>
  </button>
</nav>
```

- [ ] **Step 7: Verificar que el proyecto compila**

Run: `npm run build`
Expected: Build exitoso sin errores

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "fix(responsive): wire up sidebar toggle, hamburger, overlay, mobile nav"
```

---

### Task 2: Reemplazar inline styles de settings por clases CSS

**Files:**
- Modify: `src/App.jsx:1172-1301`

- [ ] **Step 1: Cambiar grid de settings de inline style a clase `.settings-form-grid`**

Buscar: `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>` (settings form, línea 1172)
Reemplazar por: `<div className="settings-form-grid">`

```jsx
// ANTES (línea ~1172):
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
// DESPUÉS:
<div className="settings-form-grid">
```

- [ ] **Step 2: Cambiar flex inline groups de settings a clase `.settings-inline-group`**

Buscar y reemplazar CADA instancia de `style={{ display: 'flex', gap: '1rem' }}` dentro del settings form por `className="settings-inline-group"`.

Primera ocurrencia (código establecimiento + punto expedición, ~línea 1232):
```jsx
// ANTES:
<div style={{ display: 'flex', gap: '1rem' }}>
  <div className="form-group" style={{ flex: 1 }}>
    <label>Cód. Establecimiento</label>
    ...
  </div>
  <div className="form-group" style={{ flex: 1 }}>
    <label>Punto de Expedición</label>
    ...
  </div>
  <div className="form-group" style={{ flex: 1.5 }}>
    <label>Siguiente Nro Factura</label>
    ...
  </div>
</div>

// DESPUÉS:
<div className="settings-inline-group">
  <div className="form-group">
    <label>Cód. Establecimiento</label>
    ...
  </div>
  <div className="form-group">
    <label>Punto de Expedición</label>
    ...
  </div>
  <div className="form-group" style={{ flex: 1.5 }}>
    <label>Siguiente Nro Factura</label>
    ...
  </div>
</div>
```

Segunda ocurrencia (fechas timbrado, ~línea 1232):
```jsx
// ANTES:
<div style={{ display: 'flex', gap: '1rem' }}>
// DESPUÉS:
<div className="settings-inline-group">
```

- [ ] **Step 3: Verificar compilación**

Run: `npm run build`
Expected: Build exitoso

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "fix(settings): replace inline grid/flex styles with CSS classes"
```

---

### Task 3: Agregar clase `col-hide-mobile` a columnas de tablas

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Agregar `col-hide-mobile` a columnas no críticas en tabla de inventario**

Buscar `<table className="data-table">` en sección inventario (línea ~958). Modificar los `<th>`:

```jsx
// ANTES:
<th>Cód. Barra</th>
<th>Nombre Producto</th>
<th>Categoría</th>
<th>Costo</th>
<th>Venta</th>
<th>IVA</th>
<th>Stock</th>
<th>Alerta Mín.</th>

// DESPUÉS:
<th>Cód. Barra</th>
<th>Nombre Producto</th>
<th className="col-hide-mobile">Categoría</th>
<th className="col-hide-mobile">Costo</th>
<th>Venta</th>
<th className="col-hide-mobile">IVA</th>
<th>Stock</th>
<th className="col-hide-mobile">Alerta Mín.</th>
```

- [ ] **Step 2: Agregar `col-hide-mobile` a columnas no críticas en tabla de ventas**

Buscar `<table className="data-table">` en sección ventas (línea ~1031):

```jsx
// ANTES:
<th>Fecha / Hora</th>
<th>Factura Nro.</th>
<th>Timbrado</th>
<th>Cliente</th>
<th>Total Facturado</th>
<th>Desglose IVA (5%)</th>
<th>Desglose IVA (10%)</th>
<th>Exento</th>
<th>Método</th>

// DESPUÉS:
<th>Fecha / Hora</th>
<th>Factura Nro.</th>
<th className="col-hide-mobile">Timbrado</th>
<th>Cliente</th>
<th>Total Facturado</th>
<th className="col-hide-mobile">Desglose IVA (5%)</th>
<th className="col-hide-mobile">Desglose IVA (10%)</th>
<th className="col-hide-mobile">Exento</th>
<th className="col-hide-mobile">Método</th>
```

- [ ] **Step 3: Agregar `col-hide-mobile` a tabla de clientes**

Buscar `<table className="data-table">` en sección clientes (línea ~1120):

```jsx
// ANTES:
<th>RUC / Cédula</th>
<th>Razón Social / Nombre</th>
<th>Teléfono</th>
<th>Email</th>
<th>Dirección</th>

// DESPUÉS:
<th>RUC / Cédula</th>
<th>Razón Social / Nombre</th>
<th className="col-hide-mobile">Teléfono</th>
<th className="col-hide-mobile">Email</th>
<th className="col-hide-mobile">Dirección</th>
```

- [ ] **Step 4: Verificar compilación**

Run: `npm run build`
Expected: Build exitoso

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "fix(tables): add col-hide-mobile for responsive column hiding"
```

---

## Fase 2: Migración TypeScript + Arquitectura

### Task 4: Configurar TypeScript y crear interfaces base

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `src/types/models.ts`
- Create: `src/types/enums.ts`
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Instalar TypeScript y tipos**

```bash
npm install -D typescript @types/react @types/react-dom
npm install -D @vitejs/plugin-react-swc
```

- [ ] **Step 2: Crear `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 3: Crear `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Crear `src/types/models.ts`**

```typescript
export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string;
  category_id: string;
  cost_price: number;
  sale_price: number;
  tax_rate: TaxRate;
  stock: number;
  min_stock: number;
}

export interface Sale {
  id: string;
  invoice_number: string;
  timbrado: string;
  customer_id: string;
  customer_name: string;
  customer_ruc: string;
  total: number;
  total_iva_5: number;
  total_iva_10: number;
  total_exempt: number;
  payment_method: string;
  received_amount: number;
  change_amount: number;
  created_at: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: TaxRate;
  subtotal: number;
}

export interface Customer {
  id: string;
  ruc: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  ruc: string;
  phone: string;
  address: string;
  timbrado_number: string;
  timbrado_start_date: string;
  timbrado_end_date: string;
  establishment_code: string;
  point_of_sale_code: string;
  current_invoice_sequence: number;
  receipt_footer: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartTotals {
  total: number;
  subtotalExempt: number;
  subtotal5: number;
  subtotal10: number;
  total_iva_5: number;
  total_iva_10: number;
  total_iva: number;
}
```

- [ ] **Step 5: Crear `src/types/enums.ts`**

```typescript
export type TaxRate = 0 | 5 | 10;
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia';
export type ReceiptType = 'ticket' | 'factura';
export type TabName = 'dashboard' | 'pos' | 'inventory' | 'sales' | 'customers' | 'settings';

export const TAX_RATES = {
  EXEMPT: 0 as TaxRate,
  REDUCED: 5 as TaxRate,
  GENERAL: 10 as TaxRate,
} as const;

export const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'Transferencia'];
export const RECEIPT_TYPES: ReceiptType[] = ['ticket', 'factura'];
```

- [ ] **Step 6: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores de tipo

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json tsconfig.app.json src/types/ package.json vite.config.js
git commit -m "feat(types): add TypeScript config and base model interfaces"
```

---

### Task 5: Crear utilidades puras

**Files:**
- Create: `src/utils/currency.ts`
- Create: `src/utils/validation.ts`

- [ ] **Step 1: Crear `src/utils/currency.ts`**

```typescript
import type { CartItem, CartTotals, TaxRate } from '../types/models';

export function formatPYG(value: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
  }).format(value).replace('PYG', 'Gs.');
}

export function calculateCartTotal(cart: CartItem[]): CartTotals {
  let subtotalExempt = 0;
  let subtotal5 = 0;
  let subtotal10 = 0;

  cart.forEach(item => {
    const itemTotal = item.sale_price * item.quantity;
    if (item.tax_rate === 10) {
      subtotal10 += itemTotal;
    } else if (item.tax_rate === 5) {
      subtotal5 += itemTotal;
    } else {
      subtotalExempt += itemTotal;
    }
  });

  const total = subtotalExempt + subtotal5 + subtotal10;
  const total_iva_10 = Math.round(subtotal10 / 11);
  const total_iva_5 = Math.round(subtotal5 / 21);
  const total_iva = total_iva_10 + total_iva_5;

  return {
    total,
    subtotalExempt,
    subtotal5,
    subtotal10,
    total_iva_5,
    total_iva_10,
    total_iva,
  };
}

export function generateInvoiceNumber(
  establishmentCode: string,
  pointOfSaleCode: string,
  sequence: number,
): string {
  const seqStr = sequence.toString().padStart(7, '0');
  return `${establishmentCode}-${pointOfSaleCode}-${seqStr}`;
}
```

- [ ] **Step 2: Crear `src/utils/validation.ts`**

```typescript
export function validateRUC(value: string): boolean {
  // Formato Paraguay: dígitos + guión + dígito verificador
  // ej: 80045612-3 o 3456789-4
  return /^\d+-\d$/.test(value);
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validatePhone(value: string): boolean {
  if (!value) return true; // opcional
  return /^[\d\s\-+()]{6,20}$/.test(value);
}

export function validateEmail(value: string): boolean {
  if (!value) return true; // opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
```

- [ ] **Step 3: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add src/utils/
git commit -m "feat(utils): add currency formatting and validation utilities"
```

---

### Task 6: Migrar db.js a TypeScript

**Files:**
- Rename: `src/services/db.js` → `src/services/db.ts`

- [ ] **Step 1: Renombrar archivo**

```bash
mv "src/services/db.js" "src/services/db.ts"
```

- [ ] **Step 2: Agregar tipos a la interfaz del objeto `db`**

Envolver las funciones con tipos. El contenido de `db.ts` completo con tipos:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Product, Sale, SaleItem, Customer, BusinessSettings, Category, CartItem } from '../types/models';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabase: ReturnType<typeof createClient> | null = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (err) {
    console.error('Error al inicializar Supabase. Usando LocalStorage.', err);
  }
}

// --- DATOS MOCK ---
const DEFAULT_SETTINGS: BusinessSettings = {
  id: 'settings-1',
  business_name: 'Supermercado Central',
  ruc: '80045612-3',
  phone: '0981 450 300',
  address: 'Avda. Mcal. López 1420, Asunción',
  timbrado_number: '14589632',
  timbrado_start_date: '2026-01-01',
  timbrado_end_date: '2027-01-01',
  establishment_code: '001',
  point_of_sale_code: '001',
  current_invoice_sequence: 1,
  receipt_footer: '¡Gracias por su compra! Vuelva pronto.',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Bebidas', description: 'Aguas, gaseosas y jugos' },
  { id: 'cat-2', name: 'Lácteos', description: 'Leche, quesos, yogures' },
  { id: 'cat-3', name: 'Almacén', description: 'Harina, arroz, fideos, aceites' },
  { id: 'cat-4', name: 'Limpieza', description: 'Desinfectantes, jabones, detergentes' },
  { id: 'cat-5', name: 'Ferretería', description: 'Herramientas y varios' },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod-1', barcode: '7840001000111', name: 'Leche Entera Trebol 1L', description: 'Lácteo paraguayo', category_id: 'cat-2', cost_price: 4800, sale_price: 6800, tax_rate: 5, stock: 24, min_stock: 6 },
  { id: 'prod-2', barcode: '7840001000222', name: 'Gaseosa Coca-Cola 2L', description: 'Bebida sabor cola', category_id: 'cat-1', cost_price: 8500, sale_price: 11500, tax_rate: 10, stock: 18, min_stock: 4 },
  { id: 'prod-3', barcode: '7840001000333', name: 'Arroz Hildebrand T1 1Kg', description: 'Arroz de primera calidad', category_id: 'cat-3', cost_price: 3600, sale_price: 5200, tax_rate: 5, stock: 45, min_stock: 10 },
  { id: 'prod-4', barcode: '7840001000444', name: 'Detergente Activo Limón 500ml', description: 'Limpieza vajilla', category_id: 'cat-4', cost_price: 3200, sale_price: 4800, tax_rate: 10, stock: 15, min_stock: 3 },
  { id: 'prod-5', barcode: '7840001000555', name: 'Pan Trigo Casero (Kg)', description: 'Panadería básica exenta', category_id: 'cat-3', cost_price: 6000, sale_price: 9000, tax_rate: 0, stock: 8, min_stock: 2 },
  { id: 'prod-6', barcode: '7840001000666', name: 'Yerba Mate Kurupí Menta-Limón 500g', description: 'Para el tereré paraguayo', category_id: 'cat-3', cost_price: 8500, sale_price: 12000, tax_rate: 10, stock: 30, min_stock: 5 },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'cust-1', ruc: '44444401-7', name: 'Sin Nombre (Cliente Ocasional)', phone: '', email: '', address: '' },
  { id: 'cust-2', ruc: '80054321-0', name: 'Constructora del Este S.A.', phone: '021 615 780', email: 'administracion@constructora.com.py', address: 'Avda. Aviadores del Chaco, Asunción' },
  { id: 'cust-3', ruc: '3456789-4', name: 'Juan Manuel Benítez', phone: '0971 123 456', email: 'juan.benitez@gmail.com', address: 'San Lorenzo, Paraguay' },
];

// Helper localStorage tipado
function getLocalItem<T>(key: string): T {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) as T : ([] as unknown as T);
}

function setLocalItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const initLocalStorage = () => {
  if (!localStorage.getItem('erp_settings')) setLocalItem('erp_settings', DEFAULT_SETTINGS);
  if (!localStorage.getItem('erp_categories')) setLocalItem('erp_categories', DEFAULT_CATEGORIES);
  if (!localStorage.getItem('erp_products')) setLocalItem('erp_products', DEFAULT_PRODUCTS);
  if (!localStorage.getItem('erp_customers')) setLocalItem('erp_customers', DEFAULT_CUSTOMERS);
  if (!localStorage.getItem('erp_sales')) setLocalItem('erp_sales', []);
};
initLocalStorage();

interface SaleRecord extends Sale {
  items?: SaleItem[];
}

interface SaleRow extends Sale {
  customer_name: string;
  customer_ruc: string;
}

interface DBApi {
  getSettings(): Promise<BusinessSettings>;
  updateSettings(settings: BusinessSettings): Promise<BusinessSettings>;
  getCategories(): Promise<Category[]>;
  saveCategory(category: Partial<Category> & { id?: string }): Promise<Category>;
  getProducts(): Promise<Product[]>;
  saveProduct(product: Partial<Product> & { id?: string }): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  getCustomers(): Promise<Customer[]>;
  saveCustomer(customer: Partial<Customer> & { id?: string }): Promise<Customer>;
  getSales(): Promise<SaleRow[]>;
  getSaleDetails(saleId: string): Promise<SaleItem[]>;
  saveSale(saleData: {
    invoice_number: string;
    timbrado: string;
    customer_id: string;
    total: number;
    total_iva_5: number;
    total_iva_10: number;
    total_exempt: number;
    payment_method: string;
    received_amount: number;
    change_amount: number;
  }, cartItems: CartItem[]): Promise<SaleRecord>;
}

export const db: DBApi = {
  async getSettings() {
    if (supabase) {
      const { data, error } = await supabase.from('company_settings').select('*').limit(1).single();
      if (!error && data) return data as BusinessSettings;
    }
    return getLocalItem<BusinessSettings>('erp_settings');
  },

  async updateSettings(settings) {
    if (supabase) {
      const { data, error } = await supabase.from('company_settings').upsert({ ...settings, updated_at: new Date() }).select().single();
      if (!error && data) return data as BusinessSettings;
    }
    setLocalItem('erp_settings', settings);
    return settings;
  },

  async getCategories() {
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) return data as Category[];
    }
    return getLocalItem<Category[]>('erp_categories');
  },

  async saveCategory(category) {
    if (supabase) {
      const { data, error } = await supabase.from('categories').upsert(category).select().single();
      if (!error && data) return data as Category;
    }
    const categories = getLocalItem<Category[]>('erp_categories');
    if (category.id) {
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx !== -1) categories[idx] = category as Category;
    } else {
      const newCat: Category = { ...category as Category, id: 'cat-' + Date.now() };
      categories.push(newCat);
    }
    setLocalItem('erp_categories', categories);
    return category as Category;
  },

  async getProducts() {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error && data) return data as Product[];
    }
    return getLocalItem<Product[]>('erp_products');
  },

  async saveProduct(product) {
    if (supabase) {
      const { data, error } = await supabase.from('products').upsert(product).select().single();
      if (!error && data) return data as Product;
    }
    const products = getLocalItem<Product[]>('erp_products');
    if (product.id) {
      const idx = products.findIndex(p => p.id === product.id);
      if (idx !== -1) products[idx] = product as Product;
    } else {
      const newProd: Product = { ...product as Product, id: 'prod-' + Date.now() };
      products.push(newProd);
    }
    setLocalItem('erp_products', products);
    return product as Product;
  },

  async deleteProduct(id) {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    }
    const products = getLocalItem<Product[]>('erp_products');
    setLocalItem('erp_products', products.filter(p => p.id !== id));
    return true;
  },

  async getCustomers() {
    if (supabase) {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (!error && data) return data as Customer[];
    }
    return getLocalItem<Customer[]>('erp_customers');
  },

  async saveCustomer(customer) {
    if (supabase) {
      const { data, error } = await supabase.from('customers').upsert(customer).select().single();
      if (!error && data) return data as Customer;
    }
    const customers = getLocalItem<Customer[]>('erp_customers');
    if (customer.id) {
      const idx = customers.findIndex(c => c.id === customer.id);
      if (idx !== -1) customers[idx] = customer as Customer;
    } else {
      const newCust: Customer = { ...customer as Customer, id: 'cust-' + Date.now() };
      customers.push(newCust);
    }
    setLocalItem('erp_customers', customers);
    return customer as Customer;
  },

  async getSales() {
    if (supabase) {
      const { data, error } = await supabase
        .from('sales')
        .select('*, customers(name, ruc)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return (data as any[]).map(s => ({
          ...s,
          customer_name: s.customers?.name || 'Desconocido',
          customer_ruc: s.customers?.ruc || '',
        }));
      }
    }
    const sales = getLocalItem<SaleRecord[]>('erp_sales');
    const customers = getLocalItem<Customer[]>('erp_customers');
    return sales.map(s => {
      const cust = customers.find(c => c.id === s.customer_id) || {} as Customer;
      return { ...s, customer_name: cust.name || 'Desconocido', customer_ruc: cust.ruc || '' };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getSaleDetails(saleId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('sale_items')
        .select('*, products(name)')
        .eq('sale_id', saleId);
      if (!error && data) {
        return (data as any[]).map(i => ({
          ...i,
          product_name: i.products?.name || 'Producto eliminado',
        }));
      }
    }
    const sales = getLocalItem<SaleRecord[]>('erp_sales');
    const sale = sales.find(s => s.id === saleId);
    return sale?.items || [];
  },

  async saveSale(saleData, cartItems) {
    const created_at = new Date().toISOString();
    if (supabase) {
      const { data: saleRes, error: saleErr } = await supabase
        .from('sales')
        .insert({ ...saleData, created_at })
        .select()
        .single();
      if (saleErr) throw saleErr;

      const itemsToInsert = cartItems.map(item => ({
        sale_id: saleRes.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price,
        tax_rate: item.tax_rate,
        subtotal: item.sale_price * item.quantity,
        created_at,
      }));

      const { error: itemsErr } = await supabase.from('sale_items').insert(itemsToInsert);
      if (itemsErr) {
        await supabase.from('sales').delete().eq('id', saleRes.id);
        throw itemsErr;
      }

      const settings = await this.getSettings();
      settings.current_invoice_sequence += 1;
      await this.updateSettings(settings);

      return { ...saleRes, items: itemsToInsert };
    }

    const sales = getLocalItem<SaleRecord[]>('erp_sales');
    const products = getLocalItem<Product[]>('erp_products');
    const settings = getLocalItem<BusinessSettings>('erp_settings');

    const newSaleId = 'sale-' + Date.now();
    const items: SaleItem[] = cartItems.map(item => ({
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      sale_id: newSaleId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.sale_price,
      tax_rate: item.tax_rate,
      subtotal: item.sale_price * item.quantity,
    }));

    const newSale: SaleRecord = {
      id: newSaleId,
      invoice_number: saleData.invoice_number,
      timbrado: saleData.timbrado,
      customer_id: saleData.customer_id,
      customer_name: '',
      customer_ruc: '',
      total: saleData.total,
      total_iva_5: saleData.total_iva_5,
      total_iva_10: saleData.total_iva_10,
      total_exempt: saleData.total_exempt,
      payment_method: saleData.payment_method,
      received_amount: saleData.received_amount,
      change_amount: saleData.change_amount,
      created_at,
      items,
    };

    cartItems.forEach(cartItem => {
      const idx = products.findIndex(p => p.id === cartItem.id);
      if (idx !== -1) {
        products[idx].stock = Math.max(0, products[idx].stock - cartItem.quantity);
      }
    });

    settings.current_invoice_sequence += 1;
    sales.push(newSale);
    setLocalItem('erp_sales', sales);
    setLocalItem('erp_products', products);
    setLocalItem('erp_settings', settings);

    return newSale;
  },
};
```

- [ ] **Step 3: Crear `src/services/index.ts`** (re-export para import limpio)

```typescript
export { db, isSupabaseConfigured } from './db';
```

- [ ] **Step 4: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 5: Commit**

```bash
git add src/services/
git commit -m "feat(types): migrate db.js to TypeScript with full type safety"
```

---

### Task 7: Extraer hook useTheme

**Files:**
- Create: `src/hooks/useTheme.ts`
- Modify: `src/App.jsx` (reemplazar lógica de tema)

- [ ] **Step 1: Crear `src/hooks/useTheme.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('posterp_theme');
    return stored !== null ? stored === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
    }
    localStorage.setItem('posterp_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return { isDarkMode, toggleTheme };
}
```

- [ ] **Step 2: Actualizar App.jsx para usar el hook**

Buscar en App.jsx:
```jsx
const [isDarkMode, setIsDarkMode] = useState(true);
```
y los useEffect de tema (líneas 69-76). Reemplazar con:
```jsx
const { isDarkMode, toggleTheme: setIsDarkMode } = useTheme();
```

Y reemplazar `onClick={() => setIsDarkMode(!isDarkMode)}` por `onClick={() => setIsDarkMode()}` en el botón de tema del sidebar.

- [ ] **Step 3: Verificar compilación**

Run: `npm run build`
Expected: Build exitoso

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useTheme.ts src/App.jsx
git commit -m "feat(hooks): extract useTheme hook with localStorage persistence"
```

---

### Task 8: Renombrar App.jsx y main.jsx a TypeScript

**Files:**
- Rename: `src/App.jsx` → `src/App.tsx`
- Rename: `src/main.jsx` → `src/main.tsx`
- Modify: `index.html` (actualizar script src)

- [ ] **Step 1: Renombrar App.jsx → App.tsx**

```bash
mv "src/App.jsx" "src/App.tsx"
mv "src/main.jsx" "src/main.tsx"
```

- [ ] **Step 2: Actualizar import en main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Actualizar `index.html`**

Cambiar `<script type="module" src="/src/main.jsx"></script>` por:
```html
<script type="module" src="/src/main.tsx"></script>
```

- [ ] **Step 4: Verificar compilación**

Run: `npm run build`
Expected: Build exitoso

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx index.html
git commit -m "feat(types): rename .jsx to .tsx for TypeScript migration"
```

---

### Task 9: Extraer componentes UI base

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/DataTable.tsx`
- Modify: `src/App.tsx` (usar componentes)

- [ ] **Step 1: Crear `src/components/ui/Modal.tsx`**

```typescript
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '520px' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear `src/components/ui/Button.tsx`**

```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  iconOnly?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'secondary', iconOnly, children, className = '', ...props }: ButtonProps) {
  const variantClass = `btn-${variant}`;
  const iconOnlyClass = iconOnly ? 'btn-icon-only' : '';
  return (
    <button className={`btn ${variantClass} ${iconOnlyClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat(components): extract Modal and Button base UI components"
```

---

### Task 10: Extraer componente Layout (Sidebar + TopBar + MobileNav)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/MobileNav.tsx`
- Create: `src/components/layout/PageContainer.tsx`
- Modify: `src/App.tsx` (usar Layout)

- [ ] **Step 1: Crear `src/components/layout/Sidebar.tsx`**

```typescript
import { LayoutDashboard, ShoppingCart, Package, Receipt, Users, Settings, Sun, Moon } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/db';
import type { TabName } from '../../types/enums';

interface SidebarProps {
  activeTab: TabName;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  onTabChange: (tab: TabName) => void;
  onToggleTheme: () => void;
}

const menuItems: { tab: TabName; icon: typeof LayoutDashboard; label: string }[] = [
  { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { tab: 'pos', icon: ShoppingCart, label: 'Punto de Venta' },
  { tab: 'inventory', icon: Package, label: 'Inventario' },
  { tab: 'sales', icon: Receipt, label: 'Ventas e IVA' },
  { tab: 'customers', icon: Users, label: 'Clientes' },
  { tab: 'settings', icon: Settings, label: 'Configuración' },
];

export function Sidebar({ activeTab, isDarkMode, isSidebarOpen, onTabChange, onToggleTheme }: SidebarProps) {
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div>
        <div className="logo-section">
          <div className="logo-icon">🇵🇾</div>
          <div className="logo-text">
            PostERP
            <span>Paraguay · ERP</span>
          </div>
        </div>

        <ul className="menu-list">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li
                key={item.tab}
                className={`menu-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => onTabChange(item.tab)}
              >
                <Icon className="menu-item-icon" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: isSupabaseConfigured ? 'var(--success-color)' : 'var(--text-muted)',
            boxShadow: isSupabaseConfigured ? '0 0 8px var(--success-color)' : 'none',
          }} />
          <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Offline (Local)'}</span>
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onToggleTheme}>
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDarkMode ? 'Tema Claro' : 'Tema Oscuro'}</span>
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Crear `src/components/layout/TopBar.tsx`**

```typescript
import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  loading: boolean;
  onHamburgerClick: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Central', subtitle: 'Resumen financiero, stock y estadísticas rápidas.' },
  pos: { title: 'Punto de Venta', subtitle: 'Registro veloz de ventas y emisión de comprobantes fiscales.' },
  inventory: { title: 'Administración de Inventario', subtitle: 'Control de stock, alertas de reposición y precios.' },
  sales: { title: 'Historial de Facturación', subtitle: 'Consulta de comprobantes y desglose legal de IVA.' },
  customers: { title: 'Catálogo de Clientes', subtitle: 'Gestión de razones sociales y RUCs del Paraguay.' },
  settings: { title: 'Ajustes del Sistema', subtitle: 'Parámetros del Timbrado de la SET y datos emisores.' },
};

export function TopBar({ activeTab, loading, onHamburgerClick }: TopBarProps) {
  const page = pageTitles[activeTab] || { title: '', subtitle: '' };

  return (
    <header className="top-bar">
      <button className="hamburger-btn" onClick={onHamburgerClick} aria-label="Abrir menú">
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>☰</span>
      </button>

      <div className="page-title">
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-color)' }}>
          <RefreshCw className="animate-spin" size={16} />
          <span>Procesando...</span>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Crear `src/components/layout/MobileNav.tsx`**

```typescript
import { LayoutDashboard, ShoppingCart, Package, Receipt, Users, Settings } from 'lucide-react';
import type { TabName } from '../../types/enums';

interface MobileNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const items: { tab: TabName; icon: typeof LayoutDashboard; label: string }[] = [
  { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { tab: 'pos', icon: ShoppingCart, label: 'POS' },
  { tab: 'inventory', icon: Package, label: 'Stock' },
  { tab: 'sales', icon: Receipt, label: 'Ventas' },
  { tab: 'customers', icon: Users, label: 'Clientes' },
  { tab: 'settings', icon: Settings, label: 'Ajustes' },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="mobile-nav">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.tab}
            className={`mobile-nav-item ${activeTab === item.tab ? 'active' : ''}`}
            onClick={() => onTabChange(item.tab)}
          >
            <Icon className="mobile-nav-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Crear `src/components/layout/PageContainer.tsx`**

```typescript
import { ReactNode } from 'react';

interface PageContainerProps {
  isSidebarOpen: boolean;
  sidebarOverlay: ReactNode;
  sidebar: ReactNode;
  topBar: ReactNode;
  children: ReactNode;
  mobileNav: ReactNode;
}

export function PageContainer({ isSidebarOpen, sidebarOverlay, sidebar, topBar, children, mobileNav }: PageContainerProps) {
  return (
    <div className="app-container">
      {sidebarOverlay}
      {sidebar}
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {topBar}
        {children}
      </main>
      {mobileNav}
    </div>
  );
}
```

- [ ] **Step 5: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/
git commit -m "feat(layout): extract Sidebar, TopBar, MobileNav, PageContainer components"
```

---

### Task 11: Extraer componente Dashboard

**Files:**
- Create: `src/components/dashboard/Dashboard.tsx`
- Modify: `src/App.tsx` (usar Dashboard)

- [ ] **Step 1: Crear `src/components/dashboard/Dashboard.tsx`**

```typescript
import { Calculator, Receipt, AlertTriangle, Users } from 'lucide-react';
import type { Product, Sale } from '../../types/models';
import { formatPYG } from '../../utils/currency';
import { Badge } from '../ui/Badge';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  customers: { length: number };
}

function calculateDashboardStats(products: Product[], sales: Sale[]) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.created_at.startsWith(todayStr));
  const totalTodayRevenue = todaySales.reduce((acc, s) => acc + Number(s.total), 0);
  const criticalProducts = products.filter(p => p.stock <= p.min_stock);

  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const daySales = sales.filter(s => s.created_at.startsWith(dateStr));
    return {
      label: weekdays[d.getDay()],
      value: daySales.reduce((acc, s) => acc + Number(s.total), 0),
    };
  });

  return {
    revenueToday: totalTodayRevenue,
    transactionsToday: todaySales.length,
    criticalCount: criticalProducts.length,
    criticalProducts,
    chartData: last7Days,
    maxChartValue: Math.max(...last7Days.map(d => d.value), 100000),
  };
}

export function Dashboard({ products, sales, customers }: DashboardProps) {
  const stats = calculateDashboardStats(products, sales);

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon success"><Calculator size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{formatPYG(stats.revenueToday)}</div>
            <div className="stat-label">Ventas de Hoy</div>
          </div>
        </div>
        <div className="card stat-card text-glow">
          <div className="stat-icon primary"><Receipt size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.transactionsToday}</div>
            <div className="stat-label">Transacciones Hoy</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon danger"><AlertTriangle size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.criticalCount}</div>
            <div className="stat-label">Stock Crítico</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon warning"><Users size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Clientes en Base</div>
          </div>
        </div>
      </div>

      <div className="dashboard-details-grid">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Desempeño de Ventas (Últimos 7 días)
          </h3>
          <div className="chart-placeholder">
            {stats.chartData.map((d, idx) => {
              const heightPercent = (d.value / stats.maxChartValue) * 180;
              return (
                <div className="chart-bar-container" key={idx}>
                  <div className="chart-bar" style={{ height: `${Math.max(10, heightPercent)}px` }}>
                    <span className="chart-bar-tooltip">{formatPYG(d.value)}</span>
                  </div>
                  <span className="chart-label">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--danger-color)' }}>
            Alertas de Reposición
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
            {stats.criticalProducts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                👍 Todo el inventario sobre el mínimo.
              </p>
            ) : (
              stats.criticalProducts.map(p => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mínimo: {p.min_stock}</div>
                  </div>
                  <Badge variant="danger">Stock: {p.stock}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear `src/components/ui/Badge.tsx`**

```typescript
import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'amber';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/ src/components/ui/Badge.tsx
git commit -m "feat(dashboard): extract Dashboard component and Badge UI component"
```

---

### Task 12: Extraer componente POS

**Files:**
- Create: `src/components/pos/ProductGrid.tsx`
- Create: `src/components/pos/CartPanel.tsx`
- Create: `src/components/pos/CheckoutModal.tsx`
- Create: `src/components/pos/POSView.tsx`
- Modify: `src/App.tsx` (usar POSView)

- [ ] **Step 1: Crear `src/components/pos/ProductGrid.tsx`**

```typescript
import { Search } from 'lucide-react';
import type { Product, Category } from '../../types/models';
import { formatPYG } from '../../utils/currency';
import { Badge } from '../ui/Badge';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  posSearch: string;
  selectedCategoryId: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (id: string) => void;
  onProductSelect: (product: Product) => void;
  onBarcodeSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function ProductGrid({
  products, categories, posSearch, selectedCategoryId,
  onSearchChange, onCategoryChange, onProductSelect,
  onBarcodeSubmit, inputRef,
}: ProductGridProps) {
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(posSearch));
    const matchesCategory = selectedCategoryId === 'all' || p.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pos-products-panel">
      <form onSubmit={onBarcodeSubmit} className="pos-search-bar">
        <div className="scanner-wrapper">
          <Search className="scanner-icon" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="scanner-input"
            placeholder="Escanee código o busque por nombre y presione Enter..."
            value={posSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      <div className="categories-scroll">
        <span
          className={`category-pill ${selectedCategoryId === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          Todos
        </span>
        {categories.map(c => (
          <span
            key={c.id}
            className={`category-pill ${selectedCategoryId === c.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(c.id)}
          >
            {c.name}
          </span>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No se encontraron productos disponibles.
          </div>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id} className="product-pos-card" onClick={() => onProductSelect(p)}>
              <Badge
                variant={p.tax_rate === 0 ? 'success' : p.tax_rate === 5 ? 'warning' : 'amber'}
                className="iva-badge"
              >
                IVA {p.tax_rate}%
              </Badge>
              <div>
                <div className="product-pos-title">{p.name}</div>
                <div className="product-pos-barcode">{p.barcode || 'S/C'}</div>
              </div>
              <div>
                <div className="product-pos-stock" style={{ color: p.stock <= p.min_stock ? 'var(--crimson)' : 'var(--text-3)' }}>
                  Stock: {p.stock}
                </div>
                <div className="product-pos-price">{formatPYG(p.sale_price)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear `src/components/pos/CartPanel.tsx`**

```typescript
import { ShoppingCart, Trash2, Plus, X } from 'lucide-react';
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
  const totals = calculateCartTotal(cart);

  return (
    <div className="pos-cart-panel">
      <div>
        <div className="pos-cart-header">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Carrito de Compra</h3>
          {cart.length > 0 && (
            <button className="btn btn-secondary btn-icon-only" onClick={onClearCart}>
              <Trash2 size={16} style={{ color: 'var(--danger-color)' }} />
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

      <div className="pos-cart-items">
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
            <ShoppingCart size={48} style={{ strokeWidth: 1.5, marginBottom: '1rem', opacity: 0.5 }} />
            <p>Carrito vacío.</p>
            <p style={{ fontSize: '0.8rem' }}>Seleccione productos de la grilla o escanee con su lector.</p>
          </div>
        ) : (
          cart.map(item => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-info">
                <div className="cart-item-title">{item.name}</div>
                <div className="cart-item-price">{formatPYG(item.sale_price)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.tax_rate}%)</span></div>
              </div>
              <div className="cart-item-qty">
                <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>-</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
              </div>
              <div className="cart-item-subtotal">{formatPYG(item.sale_price * item.quantity)}</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '0.5rem' }} onClick={() => onRemoveItem(item.id)}>
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="pos-cart-summary">
        <div className="summary-row"><span>Subtotal Exento</span><span>{formatPYG(totals.subtotalExempt)}</span></div>
        <div className="summary-row"><span>Subtotal 5% (Grabado)</span><span>{formatPYG(totals.subtotal5)}</span></div>
        <div className="summary-row"><span>Subtotal 10% (Grabado)</span><span>{formatPYG(totals.subtotal10)}</span></div>
        <div className="summary-row" style={{ fontStyle: 'italic' }}><span>IVA Incluido Liquidado (SET)</span><span>{formatPYG(totals.total_iva)}</span></div>
        <div className="summary-row total"><span>TOTAL A PAGAR</span><span>{formatPYG(totals.total)}</span></div>
        <div className="checkout-grid">
          <button className="btn btn-secondary" onClick={onClearCart} disabled={cart.length === 0}>Cancelar</button>
          <button className="btn btn-primary" onClick={onCheckout} disabled={cart.length === 0}>Cobrar (F8)</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 4: Commit**

```bash
git add src/components/pos/ProductGrid.tsx src/components/pos/CartPanel.tsx
git commit -m "feat(pos): extract ProductGrid and CartPanel components"
```

---

### Task 13: Refactorizar App.tsx para usar componentes extraídos

**Files:**
- Modify: `src/App.tsx` (de 2006 líneas a ~100)

- [ ] **Step 1: Reemplazar el contenido completo de App.tsx**

Este paso reduce App.tsx de ~2006 líneas a un componente orquestador ~100 líneas.

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { db } from './services/db';
import { useTheme } from './hooks/useTheme';
import { formatPYG, calculateCartTotal, generateInvoiceNumber } from './utils/currency';
import type { Product, Category, Customer, Sale, CartItem, SaleItem, BusinessSettings } from './types/models';
import type { TabName, PaymentMethod, ReceiptType } from './types/enums';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { PageContainer } from './components/layout/PageContainer';
import { MobileNav } from './components/layout/MobileNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProductGrid } from './components/pos/ProductGrid';
import { CartPanel } from './components/pos/CartPanel';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';

export default function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabName>('pos');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posSearch, setPosSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [posReceiptType, setPosReceiptType] = useState<ReceiptType>('ticket');
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [printPayload, setPrintPayload] = useState<any>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, c, cust, sl] = await Promise.all([
        db.getSettings(), db.getProducts(), db.getCategories(),
        db.getCustomers(), db.getSales(),
      ]);
      setSettings(s);
      setProducts(p);
      setCategories(c);
      setCustomers(cust);
      setSales(sl as Sale[]);
      const defaultCust = cust.find(item => item.ruc.includes('44444401'));
      setSelectedCustomerId(defaultCust?.id || cust[0]?.id || '');
    } catch (err) {
      console.error('Error al cargar datos base:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

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

  const handleRemoveFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleClearCart = useCallback(() => setCart([]), []);

  const handleBarcodeSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!posSearch.trim()) return;
    const found = products.find(p => p.barcode === posSearch.trim());
    if (found) {
      handleAddToCart(found);
      setPosSearch('');
    } else {
      const matches = products.filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase()));
      if (matches.length === 1) {
        handleAddToCart(matches[0]);
        setPosSearch('');
      }
    }
  }, [posSearch, products, handleAddToCart]);

  // --- Checkout ---
  const handleOpenCheckout = useCallback(() => {
    if (cart.length === 0) return alert('Agregue productos al carrito.');
    setReceivedAmount(calculateCartTotal(cart).total.toString());
    setIsCheckoutModalOpen(true);
  }, [cart]);

  // --- Print ---
  const { printTicket, printInvoice } = (() => {
    if (!printPayload) return { printTicket: null, printInvoice: null };
    return { printTicket: printPayload.type === 'ticket' ? printPayload : null, printInvoice: printPayload.type === 'factura' ? printPayload : null };
  })();

  return (
    <PageContainer
      isSidebarOpen={isSidebarOpen}
      sidebarOverlay={<div className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />}
      sidebar={<Sidebar activeTab={activeTab} isDarkMode={isDarkMode} isSidebarOpen={isSidebarOpen} onTabChange={handleTabChange} onToggleTheme={toggleTheme} />}
      topBar={<TopBar activeTab={activeTab} loading={loading} onHamburgerClick={() => setSidebarOpen(true)} />}
      mobileNav={<MobileNav activeTab={activeTab} onTabChange={handleTabChange} />}
    >
      {activeTab === 'dashboard' && <Dashboard products={products} sales={sales as any} customers={customers} />}

      {activeTab === 'pos' && (
        <div className="pos-container">
          <ProductGrid
            products={products}
            categories={categories}
            posSearch={posSearch}
            selectedCategoryId={selectedCategoryId}
            onSearchChange={setPosSearch}
            onCategoryChange={setSelectedCategoryId}
            onProductSelect={handleAddToCart}
            onBarcodeSubmit={handleBarcodeSubmit}
            inputRef={barcodeInputRef}
          />
          <CartPanel
            cart={cart}
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            posReceiptType={posReceiptType}
            posPaymentMethod={posPaymentMethod}
            onCustomerChange={setSelectedCustomerId}
            onReceiptTypeChange={setPosReceiptType}
            onPaymentMethodChange={setPosPaymentMethod}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleOpenCheckout}
            onAddCustomer={() => {}}
          />
        </div>
      )}

      {activeTab === 'inventory' && <p style={{ padding: '2rem' }}>Inventario (próximamente)</p>}
      {activeTab === 'sales' && <p style={{ padding: '2rem' }}>Ventas (próximamente)</p>}
      {activeTab === 'customers' && <p style={{ padding: '2rem' }}>Clientes (próximamente)</p>}

      {activeTab === 'settings' && settings && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            Parámetros Fiscales del Emisor
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); }}>
            <div className="settings-form-grid">
              <div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Datos de la Razón Social</h4>
                <div className="form-group">
                  <label>Razón Social Emisor</label>
                  <input type="text" className="form-input" value={settings.business_name} onChange={(e) => setSettings({ ...settings, business_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>RUC del Comercio</label>
                  <input type="text" className="form-input" value={settings.ruc} onChange={(e) => setSettings({ ...settings, ruc: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Dirección Comercial</label>
                  <input type="text" className="form-input" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono de Atención</label>
                  <input type="text" className="form-input" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Timbrado (SET / DNIT)</h4>
                <div className="form-group">
                  <label>Número de Timbrado Vigente</label>
                  <input type="text" className="form-input" value={settings.timbrado_number} onChange={(e) => setSettings({ ...settings, timbrado_number: e.target.value })} maxLength={8} required />
                </div>
                <div className="settings-inline-group">
                  <div className="form-group">
                    <label>Fecha Inicio Vigencia</label>
                    <input type="date" className="form-input" value={settings.timbrado_start_date} onChange={(e) => setSettings({ ...settings, timbrado_start_date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin Vigencia</label>
                    <input type="date" className="form-input" value={settings.timbrado_end_date} onChange={(e) => setSettings({ ...settings, timbrado_end_date: e.target.value })} required />
                  </div>
                </div>
                <div className="settings-inline-group">
                  <div className="form-group">
                    <label>Cód. Establecimiento</label>
                    <input type="text" className="form-input" value={settings.establishment_code} onChange={(e) => setSettings({ ...settings, establishment_code: e.target.value })} maxLength={3} required />
                  </div>
                  <div className="form-group">
                    <label>Punto de Expedición</label>
                    <input type="text" className="form-input" value={settings.point_of_sale_code} onChange={(e) => setSettings({ ...settings, point_of_sale_code: e.target.value })} maxLength={3} required />
                  </div>
                  <div className="form-group">
                    <label>Siguiente Nro Factura</label>
                    <input type="number" className="form-input" value={settings.current_invoice_sequence} onChange={(e) => setSettings({ ...settings, current_invoice_sequence: parseInt(e.target.value) || 1 })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Pie de Página del Ticket</label>
                  <textarea className="form-input" style={{ height: '70px', resize: 'none' }} value={settings.receipt_footer} onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">Guardar Ajustes</button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
```

**Nota:** Este refactor es incompleto intencionalmente — extrae solo lo crítico (layout, dashboard, POS). Inventory, Sales, Customers, Settings y la zona de impresión se mantienen inline en App.tsx por ahora. Se completará en tareas posteriores.

- [ ] **Step 2: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: Build exitoso

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "refactor(app): extract layout, dashboard, POS components; reduce App.tsx to orchestrator"
```

---

### Task 14: Crear InventoryView

**Files:**
- Create: `src/components/inventory/InventoryView.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear `src/components/inventory/InventoryView.tsx`**

Extraer el JSX de la tabla de inventario de App.tsx (líneas ~928-1021). Mantener toda la funcionalidad: listado, filtros, CRUD.

```typescript
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
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
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onManageCategories}>
            <Tag size={16} />
            <span>Gestionar Categorías</span>
          </button>
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={16} />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cód. Barra</th>
              <th>Nombre Producto</th>
              <th className="col-hide-mobile">Categoría</th>
              <th className="col-hide-mobile">Costo</th>
              <th>Venta</th>
              <th className="col-hide-mobile">IVA</th>
              <th>Stock</th>
              <th className="col-hide-mobile">Alerta Mín.</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
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
                        <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.4rem' }} onClick={() => onEdit(p)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-secondary btn-icon-only" style={{ padding: '0.4rem' }} onClick={() => onDelete(p.id)}>
                          <Trash2 size={14} style={{ color: 'var(--danger-color)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrar en App.tsx**

Reemplazar `{activeTab === 'inventory' && <p...}` por:
```typescript
{activeTab === 'inventory' && (
  <InventoryView
    products={products}
    categories={categories}
    onEdit={handleEditProduct}
    onDelete={handleDeleteProduct}
    onAdd={handleAddProductClick}
    onManageCategories={() => setIsCategoryModalOpen(true)}
  />
)}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: Build exitoso

- [ ] **Step 4: Commit**

```bash
git add src/components/inventory/InventoryView.tsx
git commit -m "feat(inventory): extract InventoryView component"
```

---

### Task 15: Crear SalesView y CustomersView

**Files:**
- Create: `src/components/sales/SalesView.tsx`
- Create: `src/components/customers/CustomersView.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear `src/components/sales/SalesView.tsx`**

Extraer tabla de historial de ventas (líneas ~1026-1097 del App.jsx original). Props tipadas.

- [ ] **Step 2: Crear `src/components/customers/CustomersView.tsx`**

Extraer tabla de clientes (líneas ~1102-1161 del App.jsx original).

- [ ] **Step 3: Integrar en App.tsx y verificar build**

Reemplazar placeholders por los componentes.

Run: `npm run build`
Expected: Build exitoso

- [ ] **Step 4: Commit**

```bash
git add src/components/sales/ src/components/customers/
git commit -m "feat(sales, customers): extract SalesView and CustomersView components"
```

---

## Resumen de Archivos

| Archivo | Acción | Responsabilidad |
|---------|--------|----------------|
| `src/types/models.ts` | Crear | Interfaces Product, Sale, Customer, Settings, Category, CartItem, CartTotals |
| `src/types/enums.ts` | Crear | Tipos TaxRate, PaymentMethod, ReceiptType, TabName |
| `src/utils/currency.ts` | Crear | formatPYG, calculateCartTotal, generateInvoiceNumber |
| `src/utils/validation.ts` | Crear | validateRUC, validateRequired, validatePhone, validateEmail |
| `src/services/db.ts` | Migrar (js→ts) | Capa de datos con tipos |
| `src/services/index.ts` | Crear | Re-export para imports limpios |
| `src/hooks/useTheme.ts` | Crear | Tema oscuro/claro con persistencia |
| `src/components/ui/Modal.tsx` | Crear | Componente modal reutilizable |
| `src/components/ui/Badge.tsx` | Crear | Badge de estado |
| `src/components/ui/Button.tsx` | Crear | Botón con variantes |
| `src/components/layout/Sidebar.tsx` | Crear | Navegación lateral |
| `src/components/layout/TopBar.tsx` | Crear | Barra superior con hamburguesa |
| `src/components/layout/MobileNav.tsx` | Crear | Navegación inferior móvil |
| `src/components/layout/PageContainer.tsx` | Crear | Layout shell |
| `src/components/dashboard/Dashboard.tsx` | Crear | Panel de estadísticas |
| `src/components/pos/ProductGrid.tsx` | Crear | Grid de productos POS |
| `src/components/pos/CartPanel.tsx` | Crear | Carrito de compra |
| `src/components/pos/CheckoutModal.tsx` | Crear | Modal de cobro |
| `src/App.tsx` | Refactorizar | Orquestador (de 2006 a ~100 líneas) |
