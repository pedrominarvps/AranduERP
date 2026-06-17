'use client';

import { useApp } from '@/lib/contexts/AppContext';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const { products, sales, customers } = useApp();
  return <Dashboard products={products} sales={sales as any} customers={customers} />;
}
