import { createClient } from '@supabase/supabase-js';
import type { Product, Sale, SaleItem, Customer, BusinessSettings, Category, CartItem } from '../types/models';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabase: any = null;
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
  if (typeof window === 'undefined') return ([] as unknown as T);
  initLocalStorage();
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) as T : ([] as unknown as T);
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

let localStorageInitialized = false;
const initLocalStorage = () => {
  if (typeof window === 'undefined') return;
  if (localStorageInitialized) return;
  localStorageInitialized = true;
  if (!localStorage.getItem('erp_settings')) setLocalItem('erp_settings', DEFAULT_SETTINGS);
  if (!localStorage.getItem('erp_categories')) setLocalItem('erp_categories', DEFAULT_CATEGORIES);
  if (!localStorage.getItem('erp_products')) setLocalItem('erp_products', DEFAULT_PRODUCTS);
  if (!localStorage.getItem('erp_customers')) setLocalItem('erp_customers', DEFAULT_CUSTOMERS);
  if (!localStorage.getItem('erp_sales')) setLocalItem('erp_sales', []);
};

interface SaleRecord extends Sale {
  items?: SaleItem[];
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
  deleteCustomer(id: string): Promise<boolean>;
  getSales(): Promise<(Sale & { customer_name: string; customer_ruc: string })[]>;
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
      const { data, error } = await (supabase.from('company_settings') as any).select('*').limit(1).single();
      if (!error && data) return data as BusinessSettings;
    }
    return getLocalItem<BusinessSettings>('erp_settings');
  },

  async updateSettings(settings) {
    if (supabase) {
      const { data, error } = await (supabase.from('company_settings') as any).upsert({ ...settings, updated_at: new Date() }).select().single();
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

  async deleteCustomer(id) {
    if (supabase) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (!error) return true;
    }
    const customers = getLocalItem<Customer[]>('erp_customers');
    setLocalItem('erp_customers', customers.filter(c => c.id !== id));
    return true;
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

    // Fallback LocalStorage
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
