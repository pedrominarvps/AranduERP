# Profit Margin Dashboard Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Margen de Ganancia" stat card to the dashboard showing total accumulated profit (all sales).

**Architecture:** Add a `db.getTotalProfit()` method that computes profit by matching sale items with current product cost prices. The dashboard page fetches this value and passes it as a prop to the Dashboard component, which renders a new stat card.

**Tech Stack:** TypeScript, React 19, Next.js 16, Supabase/localStorage

---

### Task 1: Add `getTotalProfit()` to db service

**Files:**
- Modify: `src/services/db.ts:233` (add method to DBApi interface + implementation)

- [ ] **Step 1: Add method signature to DBApi interface**

At `src/services/db.ts:232`, before `}` closing the interface:

```typescript
  getTotalProfit(): Promise<number>;
```

- [ ] **Step 2: Add implementation**

At `src/services/db.ts:613`, after `deleteSale` closing, before `}` closing the `db` object:

```typescript
  async getTotalProfit() {
    const sales = getLocalItem<SaleRecord[]>('erp_sales');
    const products = getLocalItem<Product[]>('erp_products');
    let totalProfit = 0;

    for (const sale of sales) {
      const items = sale.items || [];
      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const cost = Number(product.cost_price);
          const price = Number(item.unit_price);
          const qty = Number(item.quantity);
          totalProfit += (price - cost) * qty;
        }
      }
    }

    return totalProfit;
  },
```

- [ ] **Step 3: Verify the file parses correctly (no syntax errors)**

Run: `npx tsc --noEmit --pretty src/services/db.ts`
Or check for red squigglies. If this command doesn't work on its own, just do `npx tsc --noEmit --pretty` at project root.

---

### Task 2: Update Dashboard page to fetch profit

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Update page to import db and fetch total profit**

Replace `src/app/dashboard/page.tsx` content:

```tsx
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
```

---

### Task 3: Add profit card to Dashboard component

**Files:**
- Modify: `src/components/dashboard/Dashboard.tsx`

- [ ] **Step 1: Add TrendingUp icon to import**

```tsx
import { Calculator, Receipt, AlertTriangle, Users, TrendingUp } from 'lucide-react';
```

- [ ] **Step 2: Update DashboardProps**

```tsx
interface DashboardProps {
  products: Product[];
  sales: Sale[];
  customers: { length: number };
  totalProfit: number;
}
```

- [ ] **Step 3: Destructure totalProfit from props**

```tsx
export function Dashboard({ products, sales, customers, totalProfit }: DashboardProps) {
```

- [ ] **Step 4: Add profit stat card after "Clientes en Base" card**

After line 73 (`</div>` closing the 4th stat card), add:

```tsx
        <div className="card stat-card">
          <div className="stat-icon success"><TrendingUp size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{formatPYG(totalProfit)}</div>
            <div className="stat-label">Margen de Ganancia</div>
          </div>
        </div>
```

This goes inside the `stats-grid` div before it closes.
