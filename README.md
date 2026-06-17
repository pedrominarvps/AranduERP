# Arandu ERP

Sistema de gestión empresarial con Punto de Venta (POS) para comercios en Paraguay. Compatible con facturación SET, timbrado, IVA 5% / 10% / exento, y operación offline.

## Stack

- **Framework**: Next.js 16 + React 19
- **Lenguaje**: TypeScript
- **Base de datos**: Supabase (cloud) con localStorage como fallback offline
- **Estilos**: CSS personalizado con modo oscuro/claro
- **Iconos**: Lucide React
- **Service Worker**: Cacheo offline de assets estáticos

## Funcionalidades

- **Punto de Venta (POS)** — Búsqueda por código de barras, grilla de productos, carrito, cobro con cálculo de vuelto, liquidación de IVA
- **Inventario** — CRUD de productos con códigos de barra, precios, stock, categorías
- **Ventas e IVA** — Historial de transacciones, eliminación con reversión de stock
- **Clientes** — Registro de clientes con RUC, teléfono, dirección
- **Configuración** — Datos del emisor, timbrado SET, numeración de facturas, cambio de PIN
- **Dashboard** — Resumen de productos, ventas, ganancias
- **Impresión** — Ticket térmico (80mm) y Factura legal A4
- **Sincronización** — Offline-first: datos locales con sync a Supabase cuando hay conexión
- **PWA** — Instalable en dispositivos móviles (manifest + service worker)

## Requisitos

- Node.js >= 20
- npm

## Instalación

```bash
git clone <repo>
cd arandu-erp
npm install
```

## Configuración

Copia el archivo de entorno:

```bash
cp .env.example .env.local
```

### Supabase (opcional)

Si querés sincronización en la nube, creá un proyecto en [supabase.com](https://supabase.com) y completá en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Si dejás las variables vacías, el sistema funciona **100% offline** con almacenamiento en localStorage del navegador.

> ⚠️ **NUNCA** comittees el archivo `.env` o `.env.local`. El `.gitignore` ya los excluye.

### Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Producción

```bash
npm run build
npm start
```

## PIN de acceso por defecto

La primera vez que se inicia la app sin Supabase, el PIN se configura mediante la interfaz de Settings > Seguridad > Cambiar PIN.

Si se conecta a Supabase, el PIN se verifica contra la tabla `company_settings.access_pin`.

## Seguridad

- **Autenticación**: PIN de 6 dígitos con rate limiting (5 intentos, bloqueo 30s)
- **Sesión**: Token UUID aleatorio con expiración de 24h almacenado en localStorage
- **PIN en offline**: Hash SHA-256, nunca texto plano
- **XSS**: Sanitización de todos los campos de texto en escritura (`stripHtml`)
- **Input validation**: Validación de PIN, RUC, email y teléfono
- **Service Worker**: Solo cachea assets estáticos (GET), no datos de usuario

## Estructura del proyecto

```
src/
├── app/           # Páginas (Next.js App Router)
│   ├── pos/       # Punto de Venta
│   ├── inventory/ # Inventario
│   ├── sales/     # Ventas e IVA
│   ├── customers/ # Clientes
│   ├── settings/  # Configuración
│   ├── dashboard/ # Dashboard
│   └── login/     # Inicio de sesión
├── components/    # Componentes React
│   ├── layout/    # Sidebar, TopBar, MobileNav
│   ├── pos/       # ProductGrid, CartPanel
│   ├── dashboard/ # Dashboard
│   ├── sales/     # SalesView
│   ├── inventory/ # InventoryView
│   ├── customers/ # CustomersView
│   └── ui/        # Badge, Button, Modal
├── lib/           # Contextos (AuthContext, AppContext)
├── services/      # db.ts (capa de datos Supabase + localStorage)
├── types/         # TypeScript interfaces
├── hooks/         # Custom hooks (useTheme)
└── utils/         # Utilidades (currency, sanitize)
```

## Licencia

MIT. Ver [LICENSE](LICENSE).
