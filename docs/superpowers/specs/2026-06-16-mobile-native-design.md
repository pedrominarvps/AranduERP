# Diseño Mobile Nativo — PostERP

> Fecha: 2026-06-16  
> Estado: Aprobado

## Problema

La aplicación tiene desborde horizontal en dispositivos móviles: contenido se sale de la pantalla. El diseño actual no sigue convenciones de apps nativas (tab bar, cards, bottom sheets).

## Solución

Rediseñar la experiencia mobile con apariencia y comportamiento de app nativa.

### 1. Arreglo de desborde horizontal

- `body { overflow-x: hidden; max-width: 100vw }`
- `.app-container { overflow-x: hidden }`
- `*, *::before, *::after { box-sizing: border-box }` (asegurar)
- `.main-content` en mobile: `width: 100%; max-width: 100vw; padding: 0.75rem`
- Eliminar `min-width` fijos que causan desborde (`.cart-item-subtotal`)

### 2. Sidebar / main-content overlap fix (tablet)

En layout.tsx, aplicar clase condicional:
```tsx
<main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
```

### 3. Tab bar estilo iOS (MobileNav)

- 5 tabs principales: POS, Ventas, Stock, Dashboard, Ajustes
- 6to item "Más" → menú desplegable con Clientes
- Fondo vítreo: `background: rgba(15,23,42,0.85); backdrop-filter: blur(12px)`
- Item activo: icono + texto en `#F59E0B` (amber)
- `padding-bottom: env(safe-area-inset-bottom)`
- Animación sutil en cambio de tab

### 4. Tablas → Tarjetas estilo lista nativa (mobile < 768px)

- Cada fila se convierte en `<div class="native-list-item">`
- Estructura: icono | título + subtítulo | badge/chevron
- Táctil: `cursor: pointer; active: scale(0.98); transition: background 0.15s`
- `border-bottom: 1px solid var(--border)` entre items
- Oculto en desktop (`display: none`)
- Visible solo en `@media (max-width: 767px)`

**Inventory**: icono de producto (package) | nombre + precio/barcode | stock badge + >
**Sales**: icono de recibo | factura nro + fecha | monto + >
**Customers**: avatar inicial | nombre + RUC | teléfono + >

### 5. POS refinements

- Search bar full-width con búsqueda sin botón submit
- Category chips en scroll horizontal (`overflow-x: auto; scroll-snap-type`)
- Bottom cart bar: badge cantidad + total + botón "Cobrar" grande
- Cart panel como bottom sheet con handle bar visual

### 6. Modales como bottom sheets (mobile)

- Handle bar: `36px × 4px`, centrado, `border-radius: 4px`
- Animación `slideFromBottom` consistente
- `border-radius: 16px 16px 0 0`
- Full-width en mobile

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/app/globals.css` | overflow fixes, native list items, tab bar iOS, bottom sheet handle |
| `src/app/layout.tsx` | sidebar-open class condicional |
| `src/components/layout/MobileNav.tsx` | iOS tab bar con 5 items + "Más" |
| `src/app/inventory/page.tsx` | Opcional: estado para vista detalle |
| `src/app/sales/page.tsx` | Opcional: estado para vista detalle |
| `src/app/customers/page.tsx` | Opcional: estado para vista detalle |

## Criterios de éxito

- Sin scroll horizontal en ningún dispositivo < 768px
- POS: carrito como bottom sheet funcional
- Tablas convertidas a tarjetas legibles en mobile
- Tab bar con glassmorphism y 5 tabs + "Más"
- Layout.tsx corrige solapamiento sidebar en tablet
