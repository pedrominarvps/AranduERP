'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { db } from '@/services/db';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const { products, sales, customers } = useApp();
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    db.getTotalProfit().then(setTotalProfit);
  }, [sales]);

  return <Dashboard products={products} sales={sales as any} customers={customers} totalProfit={totalProfit} />;
}
