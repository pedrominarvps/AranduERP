import { createClient } from '@supabase/supabase-js';
import type { Product, Sale, SaleItem, Customer, BusinessSettings, Category, CartItem } from '../types/models';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

function isValidUrl(str: string | undefined): boolean {
  if (!str) return false;
  if (!str.startsWith('http://') && !str.startsWith('https://')) return false;
  try { new URL(str); return true; }
  catch { return false; }
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl));

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

function removeLocalItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

const initLocalStorage = () => {
  if (typeof window === 'undefined') return;
  // Verify each key individually instead of using a module-level flag
  // that resets on Next.js HMR, which would overwrite real data with mock defaults.
  if (!localStorage.getItem('erp_settings')) setLocalItem('erp_settings', DEFAULT_SETTINGS);
  if (!localStorage.getItem('erp_categories')) setLocalItem('erp_categories', DEFAULT_CATEGORIES);
  if (!localStorage.getItem('erp_products')) setLocalItem('erp_products', DEFAULT_PRODUCTS);
  if (!localStorage.getItem('erp_customers')) setLocalItem('erp_customers', DEFAULT_CUSTOMERS);
  if (!localStorage.getItem('erp_sales')) setLocalItem('erp_sales', []);
};

// --- SYNC ENGINE ---
const SYNC_KEY = 'erp_sync_pending';

async function checkConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('company_settings').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

function getPendingTables(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function markPending(table: string) {
  if (typeof window === 'undefined') return;
  const existing = getPendingTables();
  if (!existing.includes(table)) {
    existing.push(table);
    localStorage.setItem(SYNC_KEY, JSON.stringify(existing));
  }
}

function clearPending() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SYNC_KEY);
  // Also clean up delete queues
  ['company_settings', 'categories', 'products', 'customers', 'sales', 'sale_items'].forEach(t => {
    removeLocalItem(`erp_sync_deletes_${t}`);
  });
}

function getDeleteQueue(table: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`erp_sync_deletes_${table}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function markDelete(table: string, id: string) {
  if (typeof window === 'undefined') return;
  const queue = getDeleteQueue(table);
  if (!queue.includes(id)) {
    queue.push(id);
    setLocalItem(`erp_sync_deletes_${table}`, queue);
  }
}

async function syncPendingChanges(): Promise<void> {
  if (!supabase) return;
  const tables = getPendingTables();
  if (tables.length === 0) return;
  if (!await checkConnection()) return;

  for (const table of tables) {
    // 1. Process pending deletes for this table first
    const deleteIds = getDeleteQueue(table);
    for (const id of deleteIds) {
      try {
        await supabase.from(table).delete().eq('id', id);
      } catch (err) {
        console.warn(`Error sync delete ${table}.${id}:`, err);
        return; // Retry next time
      }
    }
    removeLocalItem(`erp_sync_deletes_${table}`);

    // 2. Upsert all current local data
    try {
      const localKey = `erp_${table}`;
      const localData = getLocalItem<any[]>(localKey);
      if (!localData || localData.length === 0) continue;
      const BATCH = 50;
      for (let i = 0; i < localData.length; i += BATCH) {
        const batch = localData.slice(i, i + BATCH);
        const { error } = await supabase.from(table).upsert(batch);
        if (error) throw error;
      }
    } catch (err) {
      console.warn(`Error sync table "${table}", reintentará después:`, err);
      return;
    }
  }
  clearPending();
}

// --- HELPERS ---

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
  checkConnection(): Promise<boolean>;
  syncPendingChanges(): Promise<void>;
}

export const db: DBApi = {
  // --- READS: prefer Supabase, cache in localStorage ---

  async getSettings() {
    if (supabase) {
      try {
        const { data, error } = await (supabase.from('company_settings') as any).select('*').limit(1).single();
        if (!error && data) {
          setLocalItem('erp_settings', data as BusinessSettings);
          return data as BusinessSettings;
        }
      } catch {}
    }
    return getLocalItem<BusinessSettings>('erp_settings');
  },

  async getCategories() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (!error && data) {
          setLocalItem('erp_categories', data as Category[]);
          return data as Category[];
        }
      } catch {}
    }
    return getLocalItem<Category[]>('erp_categories');
  },

  async getProducts() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (!error && data) {
          setLocalItem('erp_products', data as Product[]);
          return data as Product[];
        }
      } catch {}
    }
    return getLocalItem<Product[]>('erp_products');
  },

  async getCustomers() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('customers').select('*').order('name');
        if (!error && data) {
          setLocalItem('erp_customers', data as Customer[]);
          return data as Customer[];
        }
      } catch {}
    }
    return getLocalItem<Customer[]>('erp_customers');
  },

  async getSales() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*, customers(name, ruc)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const mapped = (data as any[]).map(s => ({
            ...s,
            customer_name: s.customers?.name || 'Desconocido',
            customer_ruc: s.customers?.ruc || '',
          }));
          setLocalItem('erp_sales', mapped);
          return mapped;
        }
      } catch {}
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
      try {
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
      } catch {}
    }
    const sales = getLocalItem<SaleRecord[]>('erp_sales');
    const sale = sales.find(s => s.id === saleId);
    return sale?.items || [];
  },

  // --- WRITES: always persist to localStorage, then try Supabase ---

  async updateSettings(settings) {
    setLocalItem('erp_settings', settings);
    if (supabase) {
      try {
        await supabase.from('company_settings').upsert({ ...settings, updated_at: new Date() });
      } catch {
        markPending('company_settings');
      }
    }
    return settings;
  },

  async saveCategory(category) {
    const categories = getLocalItem<Category[]>('erp_categories');
    let saved: Category;
    if (category.id) {
      const idx = categories.findIndex(c => c.id === category.id);
      if (idx !== -1) categories[idx] = category as Category;
      saved = category as Category;
    } else {
      saved = { ...category as Category, id: 'cat-' + Date.now() };
      categories.push(saved);
    }
    setLocalItem('erp_categories', categories);

    if (supabase) {
      try {
        await supabase.from('categories').upsert(saved);
      } catch {
        markPending('categories');
      }
    }
    return saved;
  },

  async saveProduct(product) {
    const products = getLocalItem<Product[]>('erp_products');
    let saved: Product;
    if (product.id) {
      const idx = products.findIndex(p => p.id === product.id);
      if (idx !== -1) products[idx] = product as Product;
      saved = product as Product;
    } else {
      saved = { ...product as Product, id: 'prod-' + Date.now() };
      products.push(saved);
    }
    setLocalItem('erp_products', products);

    if (supabase) {
      try {
        await supabase.from('products').upsert(saved);
      } catch {
        markPending('products');
      }
    }
    return saved;
  },

  async deleteProduct(id) {
    const products = getLocalItem<Product[]>('erp_products');
    setLocalItem('erp_products', products.filter(p => p.id !== id));
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch {
        markDelete('products', id);
        markPending('products');
      }
    }
    return true;
  },

  async saveCustomer(customer) {
    const customers = getLocalItem<Customer[]>('erp_customers');
    let saved: Customer;
    if (customer.id) {
      const idx = customers.findIndex(c => c.id === customer.id);
      if (idx !== -1) customers[idx] = customer as Customer;
      saved = customer as Customer;
    } else {
      saved = { ...customer as Customer, id: 'cust-' + Date.now() };
      customers.push(saved);
    }
    setLocalItem('erp_customers', customers);

    if (supabase) {
      try {
        await supabase.from('customers').upsert(saved);
      } catch {
        markPending('customers');
      }
    }
    return saved;
  },

  async deleteCustomer(id) {
    const customers = getLocalItem<Customer[]>('erp_customers');
    setLocalItem('erp_customers', customers.filter(c => c.id !== id));
    if (supabase) {
      try {
        await supabase.from('customers').delete().eq('id', id);
      } catch {
        markDelete('customers', id);
        markPending('customers');
      }
    }
    return true;
  },

  async saveSale(saleData, cartItems) {
    const created_at = new Date().toISOString();

    const sales = getLocalItem<SaleRecord[]>('erp_sales');
    const localProducts = getLocalItem<Product[]>('erp_products');
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
      const idx = localProducts.findIndex(p => p.id === cartItem.id);
      if (idx !== -1) {
        localProducts[idx].stock = Math.max(0, localProducts[idx].stock - cartItem.quantity);
      }
    });

    settings.current_invoice_sequence += 1;
    sales.push(newSale);
    setLocalItem('erp_sales', sales);
    setLocalItem('erp_products', localProducts);
    setLocalItem('erp_settings', settings);

    if (supabase) {
      try {
        const { data: saleRes, error: saleErr } = await supabase
          .from('sales')
          .insert({ ...saleData, created_at })
          .select()
          .single();
        if (!saleErr && saleRes) {
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
            markPending('sales');
            markPending('sale_items');
          }
        } else {
          markPending('sales');
          markPending('sale_items');
        }
      } catch {
        markPending('sales');
        markPending('sale_items');
      }
    }

    return newSale;
  },

  async checkConnection() {
    return checkConnection();
  },

  async syncPendingChanges() {
    return syncPendingChanges();
  },
};
