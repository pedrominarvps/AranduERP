-- Esquema SQL de Base de Datos para Supabase (Arandu ERP)
-- Copia y pega este script en el editor SQL de Supabase (SQL Editor) para inicializar tu base de datos.

-- ============================================================
-- 1. FUNCIÓN PARA UPDATED_AT (compartida entre tablas)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. CONFIGURACIÓN DE LA EMPRESA
-- ============================================================
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE TRIGGER trg_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO company_settings (business_name, ruc, phone, address, timbrado_number, establishment_code, point_of_sale_code, current_invoice_sequence, receipt_footer)
SELECT 'Mi Negocio ERP', '80000000-1', '0981 123 456', 'Asunción, Paraguay', '12345678', '001', '001', 1, '¡Gracias por su preferencia!'
WHERE NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1);

-- ============================================================
-- 3. CATEGORÍAS
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO categories (name, description) VALUES
    ('Bebidas', 'Gaseosas, jugos, aguas y bebidas en general'),
    ('Lácteos', 'Leches, quesos, yogures'),
    ('Almacén', 'Productos secos, fideos, arroz, aceites'),
    ('Limpieza', 'Jabones, detergentes, desinfectantes'),
    ('Varios', 'Otros productos sin categoría específica')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    sale_price NUMERIC NOT NULL DEFAULT 0,
    tax_rate NUMERIC NOT NULL CHECK (tax_rate IN (0, 5, 10)),
    stock NUMERIC NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock NUMERIC NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

INSERT INTO products (barcode, name, description, cost_price, sale_price, tax_rate, stock, min_stock) VALUES
    ('7840001000111', 'Leche Entera 1L', 'Leche entera UHT', 4500, 6500, 5, 20, 5),
    ('7840001000222', 'Gaseosa Cola 2L', 'Gaseosa sabor cola familiar', 7000, 10000, 10, 15, 4),
    ('7840001000333', 'Arroz Premium 1Kg', 'Arroz tipo 1', 3800, 5500, 5, 30, 10),
    ('7840001000444', 'Detergente Líquido 500ml', 'Detergente lavavajilla aroma limón', 4000, 6000, 10, 12, 3),
    ('7840001000555', 'Pan Felipe (Kg)', 'Pan fresco del día (Exento de IVA)', 6000, 8000, 0, 5, 2)
ON CONFLICT (barcode) DO NOTHING;

-- ============================================================
-- 5. CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruc TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

INSERT INTO customers (ruc, name, phone, email, address) VALUES
    ('44444401-7', 'Sin Nombre (Cliente Ocasional)', '', '', ''),
    ('80012345-6', 'Distribuidora Central S.A.', '021 500 600', 'contacto@distribuidora.com.py', 'Aviadores del Chaco, Asunción')
ON CONFLICT (ruc) DO NOTHING;

-- ============================================================
-- 6. VENTAS (Cabecera)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    timbrado TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name TEXT,          -- Desnormalizado para preservar el nombre histórico
    customer_ruc TEXT,           -- Desnormalizado para preservar el RUC histórico
    total NUMERIC NOT NULL DEFAULT 0,
    total_iva_5 NUMERIC NOT NULL DEFAULT 0,
    total_iva_10 NUMERIC NOT NULL DEFAULT 0,
    total_exempt NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Efectivo', 'Tarjeta', 'Transferencia')),
    received_amount NUMERIC NOT NULL DEFAULT 0,
    change_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales(invoice_number);

-- ============================================================
-- 7. DETALLES DE VENTA (Items)
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT,           -- Desnormalizado para preservar el nombre histórico del producto
    quantity NUMERIC NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL DEFAULT 0,
    tax_rate NUMERIC NOT NULL CHECK (tax_rate IN (0, 5, 10)),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- ============================================================
-- 8. TRIGGER: DESCONTAR STOCK AL VENDER
-- ============================================================
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    IF NOT FOUND THEN
        RAISE WARNING 'Producto con id % no encontrado al descontar stock.', NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_stock_on_sale ON sale_items;
CREATE TRIGGER trg_update_stock_on_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_sale();

-- ============================================================
-- 9. POLÍTICAS RLS (Row Level Security)
-- ============================================================
-- Habilita RLS en cada tabla y permite acceso público anónimo
-- (Ajusta según tu esquema de autenticación)

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (anónimo) para operaciones CRUD
CREATE POLICY "Acceso público anónimo" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público anónimo" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público anónimo" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público anónimo" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público anónimo" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público anónimo" ON sale_items FOR ALL USING (true) WITH CHECK (true);
