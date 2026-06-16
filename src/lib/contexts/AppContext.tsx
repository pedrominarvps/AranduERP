'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { db } from '../../services/db';
import type { Product, Category, Customer, Sale, BusinessSettings } from '../../types/models';

interface AppContextType {
  settings: BusinessSettings | null;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  sales: Sale[];
  loading: boolean;
  printPayload: any;
  setPrintPayload: (payload: any) => void;
  loadAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [printPayload, setPrintPayload] = useState<any>(null);

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
      // Auto-sync pending changes after loading fresh data
      db.syncPendingChanges().catch(console.error);
    } catch (err) {
      console.error('Error al cargar datos base:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  return (
    <AppContext.Provider value={{ settings, products, categories, customers, sales, loading, printPayload, setPrintPayload, loadAllData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
