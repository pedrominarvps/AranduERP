# Profit Margin Dashboard Card

## Problem
The dashboard shows revenue, transactions, critical stock, and total customers, but does not show how much profit (margin) the business has generated.

## Solution
Add a "Margen de Ganancia" stat card to the dashboard showing the total accumulated profit across all sales.

## Design

### Profit Calculation
- **Method**: Lookup current `cost_price` from products table at calculation time
- **Formula**: For each sale item, `profit = (unit_price - product.cost_price) × quantity`
- **Sum**: Total profit = sum of all item-level profits across all sales
- **Trade-off**: Uses current product cost, not cost-at-time-of-sale. Simpler to implement, no schema changes needed.

### New DB Method: `db.getTotalProfit()`
- Gets all sales and their items
- For each item, looks up the product's current `cost_price`
- Computes and returns total accumulated profit

### Dashboard Changes
- **Dashboard page**: Calls `db.getTotalProfit()` and passes the result as a new prop to the Dashboard component
- **Dashboard component**: Adds a new stat card styled like the existing ones:
  - Icon: TrendingUp or similar (green)
  - Value: Formatted as PYG using `formatPYG()`
  - Label: "Margen de Ganancia"

### Data Flow
```
DashboardPage: useApp() -> products, sales, customers + db.getTotalProfit() -> profit total
  -> Dashboard component receives { products, sales, customers, totalProfit }
  -> calculateDashboardStats adds totalProfit to stats
  -> render new stat card
```

### Files to Modify
1. `src/services/db.ts` — Add `getTotalProfit()` method
2. `src/app/dashboard/page.tsx` — Fetch profit data, pass to Dashboard
3. `src/components/dashboard/Dashboard.tsx` — Add profit card + update types
