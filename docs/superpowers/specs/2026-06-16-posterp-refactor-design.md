# PostERP — Especificación de Refactorización

## 1. Problemas Identificados

### Responsive (CRÍTICO)
El CSS tiene un sistema responsive completo para 3 breakpoints (desktop >1200px, tablet 768-1199px, móvil <768px) que incluye:
- `.hamburger-btn` — botón de menú hamburguesa
- `.sidebar-overlay` — overlay para cerrar sidebar en móvil
- `.sidebar.open` / `.sidebar:not(.open)` — drawer colapsable
- `.main-content.sidebar-open` — ajuste de margen
- `.mobile-nav` — navegación inferior para móvil
- `.settings-form-grid` — grid responsive de configuración
- `.col-hide-mobile` — ocultar columnas en tablas móviles
- `.settings-inline-group` — grupos inline en settings

**Ninguna de estas clases se implementa en App.jsx.** El sistema responsive no funciona.

### Arquitectura
- `App.jsx` tiene ~1300 líneas con toda la lógica y UI en un solo archivo
- Sin TypeScript — operaciones con `any` implícito, bugs evitables
- Sin estado global — props y estados duplicados, sin separación de responsabilidades
- Lógica de negocio mezclada con render JSX

## 2. Alcance del Refactor

### Fase 1: Reparación Responsive (inmediata)
Restaurar la funcionalidad responsive que el CSS ya define pero el JSX no implementa.

### Fase 2: Migración TypeScript + Arquitectura
Migración incremental a TypeScript con extracción de hooks, contextos y componentes.

---

## 3. Fase 1 — Reparación Responsive

### 3.1 Componentes a agregar en JSX

| Elemento | Estado actual | Solución |
|----------|---------------|----------|
| `hamburger-btn` | No existe en JSX | Agregar `<button>` en `top-bar` → toggle `isSidebarOpen` |
| `sidebar-overlay` | No existe en JSX | Agregar `<div>` overlay → `onClick={() => setSidebarOpen(false)}` |
| `mobile-nav` | No existe en JSX | Agregar nav inferior con 6 íconos (Dashboard, POS, Inventario, Ventas, Clientes, Config) |
| `.open` en sidebar | No se aplica | `className={open ? 'sidebar open' : 'sidebar'}` |
| `.sidebar-open` en main-content | No se aplica | `className={open ? 'main-content sidebar-open' : 'main-content'}` |
| `col-hide-mobile` | No se aplica en `<th>`/`<td>` | Agregar clase a columnas no críticas (Costo, IVA, Alerta Mín) |

### 3.2 Estado del Sidebar

```tsx
const [isSidebarOpen, setSidebarOpen] = useState(false);
```

- En móvil: sidebar es drawer oculto (`transform: translateX(-100%)`), se muestra al tocar hamburguesa
- En tablet: sidebar colapsa a iconos por defecto, hamburguesa lo expande
- Cerrar al hacer clic en overlay o en un ítem del menú

### 3.3 Correcciones CSS adicionales

| Problema | Solución |
|----------|----------|
| Settings usa `style={{ gridTemplateColumns: '1fr 1fr' }}` inline | Cambiar a clase `.settings-form-grid` |
| Grupos inline en settings usan `style={{ display: 'flex', gap: '1rem' }}` | Cambiar a `.settings-inline-group` |
| Columnas de tabla no tienen `col-hide-mobile` | Agregar a: Costo, Categoría, IVA, Alerta Mín. |

---

## 4. Fase 2 — Migración TypeScript + Arquitectura

### 4.1 Estructura de carpetas

```
src/
├── components/
│   ├── ui/          # Button, Input, Select, Modal, Badge, DataTable
│   ├── layout/      # Sidebar, TopBar, MobileNav, PageContainer
│   ├── pos/         # ProductGrid, CartPanel, CategoryFilter, CheckoutModal
│   ├── dashboard/   # StatCard, SalesChart, StockAlerts
│   ├── inventory/   # ProductTable, ProductForm, CategoryManager
│   ├── sales/       # SalesTable, SaleDetailModal
│   ├── customers/   # CustomerTable, CustomerForm
│   └── settings/    # SettingsForm
├── hooks/
│   ├── useTheme.ts
│   └── ... (migración progresiva)
├── context/
│   └── CartContext.tsx (migración progresiva)
├── services/
│   ├── db.ts        ← migrar db.js a TS
│   └── index.ts
├── types/
│   ├── models.ts    ← interfaces: Product, Sale, Customer, Settings, Category
│   └── enums.ts     ← TaxRate, PaymentMethod, ReceiptType
├── utils/
│   ├── currency.ts  ← formatPYG, calculateIVABreakdown
│   ├── validation.ts← validateRUC, requiredFields
│   └── print.ts     ← ticket/factura HTML generators
└── App.tsx          ← < 100 líneas, orquesta todo
```

### 4.2 Orden de Migración Incremental

| Paso | Archivos | Dependencias |
|------|----------|-------------|
| 1 | `types/models.ts`, `types/enums.ts` | Ninguna |
| 2 | `utils/currency.ts`, `utils/validation.ts`, `utils/print.ts` | types |
| 3 | `services/db.ts` (.js → .ts) | types |
| 4 | `hooks/useTheme.ts` | types |
| 5 | `components/ui/*` | types, utils |
| 6 | `components/layout/*` | hooks, ui |
| 7 | `components/pos/*` | services, hooks, ui, layout |
| 8 | `components/dashboard/*`, `inventory/*`, `sales/*`, `customers/*`, `settings/*` | services, hooks, ui |
| 9 | `App.tsx` | todos los componentes |

### 4.3 Tipos Principales

```typescript
// types/models.ts
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
  payment_method: PaymentMethod;
  received_amount: number;
  change_amount: number;
  created_at: string;
}

export interface Customer {
  id: string;
  ruc: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Settings {
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

// types/enums.ts
export type TaxRate = 0 | 5 | 10;
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia';
export type ReceiptType = 'ticket' | 'factura';
export type TabName = 'dashboard' | 'pos' | 'inventory' | 'sales' | 'customers' | 'settings';
```

---

## 5. No Incluye (fuera de alcance)

- Autenticación / roles de usuario
- Exportación a Excel/PDF
- Módulo de reportes avanzados
- Multi-sucursal
- PWA offline service worker
- i18n multi-idioma

Estos pueden agregarse después sobre la nueva arquitectura limpia.

---

## 6. Documento Aprobado

Esta especificación fue revisada y aprobada por el usuario.
