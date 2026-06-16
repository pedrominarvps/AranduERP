-- Esquema SQL de Base de Datos para Supabase
-- Copia y pega este script en el editor SQL de Supabase (SQL Editor) para inicializar tu base de datos.

-- 1. Deshabilitar RLS temporalmente o configurar tablas directamente
-- Si deseas usar RLS (Row Level Security), puedes añadir las políticas correspondientes. Para este ejemplo
-- inicial, configuramos la base de datos de manera accesible.

-- Crear Tabla de Configuración de la Empresa
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL DEFAULT 'Mi Negocio ERP',
    ruc TEXT NOT NULL DEFAULT '80000000-1',
    phone TEXT DEFAULT '0981 123 456',
    address TEXT DEFAULT 'Asunción, Paraguay',
    timbrado_number TEXT NOT NULL DEFAULT '12345678',
    timbrado_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    timbrado_end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    establishment_code TEXT NOT NULL DEFAULT '001',
    point_of_sale_code TEXT NOT NULL DEFAULT '001',
    current_invoice_sequence INT NOT NULL DEFAULT 1,
    receipt_footer TEXT DEFAULT '¡Gracias por su preferencia!',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar configuración inicial por defecto
INSERT INTO company_settings (business_name, ruc, phone, address, timbrado_number, establishment_code, point_of_sale_code, current_invoice_sequence, receipt_footer)
SELECT 'Mi Negocio ERP', '80000000-1', '0981 123 456', 'Asunción, Paraguay', '12345678', '001', '001', 1, '¡Gracias por su preferencia!'
WHERE NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1);

-- Crear Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar categorías por defecto
INSERT INTO categories (name, description) VALUES
('Bebidas', 'Gaseosas, jugos, aguas y bebidas en general'),
('Lácteos', 'Leches, quesos, yogures'),
('Almacén', 'Productos secos, fideos, arroz, aceites'),
('Limpieza', 'Jabones, detergentes, desinfectantes'),
('Varios', 'Otros productos sin categoría específica')
ON CONFLICT (name) DO NOTHING;

-- Crear Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    sale_price NUMERIC NOT NULL DEFAULT 0,
    tax_rate NUMERIC NOT NULL CHECK (tax_rate IN (0, 5, 10)), -- Tasas de IVA de Paraguay
    stock NUMERIC NOT NULL DEFAULT 0,
    min_stock NUMERIC NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar algunos productos de ejemplo
INSERT INTO products (barcode, name, description, cost_price, sale_price, tax_rate, stock, min_stock) VALUES
('7840001000111', 'Leche Entera 1L', 'Leche entera UHT', 4500, 6500, 5, 20, 5),
('7840001000222', 'Gaseosa Cola 2L', 'Gaseosa sabor cola familiar', 7000, 10000, 10, 15, 4),
('7840001000333', 'Arroz Premium 1Kg', 'Arroz tipo 1', 3800, 5500, 5, 30, 10),
('7840001000444', 'Detergente Líquido 500ml', 'Detergente lavavajilla aroma limón', 4000, 6000, 10, 12, 3),
('7840001000555', 'Pan Felipe (Kg)', 'Pan fresco del día (Exento de IVA)', 6000, 8000, 0, 5, 2)
ON CONFLICT (barcode) DO NOTHING;

-- Crear Tabla de Clientes
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruc TEXT UNIQUE NOT NULL, -- RUC con o sin DV (ej. 4321098-5 o 44444401-7)
    name TEXT NOT NULL,       -- Razón Social o Nombre
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar clientes por defecto
INSERT INTO customers (ruc, name, phone, email, address) VALUES
('44444401-7', 'Sin Nombre (Cliente Ocasional)', '', '', ''),
('80012345-6', 'Distribuidora Central S.A.', '021 500 600', 'contacto@distribuidora.com.py', 'Aviadores del Chaco, Asunción')
ON CONFLICT (ruc) DO NOTHING;

-- Crear Tabla de Ventas (Cabecera de Factura/Ticket)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,     -- Número secuencial ej. 001-001-0000001
    timbrado TEXT NOT NULL,           -- Timbrado vigente en la venta
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    total NUMERIC NOT NULL DEFAULT 0,
    total_iva_5 NUMERIC NOT NULL DEFAULT 0,  -- Liquidación de IVA 5% (Monto IVA = Subtotal / 21)
    total_iva_10 NUMERIC NOT NULL DEFAULT 0, -- Liquidación de IVA 10% (Monto IVA = Subtotal / 11)
    total_exempt NUMERIC NOT NULL DEFAULT 0, -- Monto Exento
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Efectivo', 'Tarjeta', 'Transferencia')),
    received_amount NUMERIC NOT NULL DEFAULT 0,
    change_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear Tabla de Detalles de Venta (Items)
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    tax_rate NUMERIC NOT NULL CHECK (tax_rate IN (0, 5, 10)),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear una función y disparador en Supabase para reducir stock automáticamente al vender
CREATE OR REPLACE FUNCTION update_stock_on_sale() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_stock_on_sale
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_sale();
