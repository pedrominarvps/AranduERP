import { Calculator, Receipt, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import type { Product, Sale } from '../../types/models';
import { formatPYG } from '../../utils/currency';
import { Badge } from '../ui/Badge';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  customers: { length: number };
}

function calculateDashboardStats(products: Product[], sales: Sale[]) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.created_at.startsWith(todayStr));
  const totalTodayRevenue = todaySales.reduce((acc, s) => acc + Number(s.total), 0);
  const criticalProducts = products.filter(p => p.stock <= p.min_stock);

  let totalProfit = 0;
  for (const sale of sales) {
    const items = (sale as any).items || [];
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        totalProfit += (Number(item.unit_price) - Number(product.cost_price)) * Number(item.quantity);
      }
    }
  }

  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const daySales = sales.filter(s => s.created_at.startsWith(dateStr));
    return {
      label: weekdays[d.getDay()],
      value: daySales.reduce((acc, s) => acc + Number(s.total), 0),
    };
  });

  return {
    revenueToday: totalTodayRevenue,
    transactionsToday: todaySales.length,
    criticalCount: criticalProducts.length,
    criticalProducts,
    chartData: last7Days,
    maxChartValue: Math.max(...last7Days.map(d => d.value), 100000),
    totalProfit,
  };
}

export function Dashboard({ products, sales, customers }: DashboardProps) {
  const stats = calculateDashboardStats(products, sales);

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon success"><Calculator size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{formatPYG(stats.revenueToday)}</div>
            <div className="stat-label">Ventas de Hoy</div>
          </div>
        </div>
        <div className="card stat-card text-glow">
          <div className="stat-icon primary"><Receipt size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.transactionsToday}</div>
            <div className="stat-label">Transacciones Hoy</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon danger"><AlertTriangle size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.criticalCount}</div>
            <div className="stat-label">Stock Crítico</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon warning"><Users size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Clientes en Base</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success"><TrendingUp size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{formatPYG(stats.totalProfit)}</div>
            <div className="stat-label">Margen de Ganancia</div>
          </div>
        </div>
      </div>

      <div className="dashboard-details-grid">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Desempeño de Ventas (Últimos 7 días)
          </h3>
          <div className="chart-placeholder">
            {stats.chartData.map((d, idx) => {
              const heightPercent = (d.value / stats.maxChartValue) * 180;
              return (
                <div className="chart-bar-container" key={idx}>
                  <div className="chart-bar" style={{ height: `${Math.max(10, heightPercent)}px` }}>
                    <span className="chart-bar-tooltip">{formatPYG(d.value)}</span>
                  </div>
                  <span className="chart-label">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--danger-color)' }}>
            Alertas de Reposición
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
            {stats.criticalProducts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                Todo el inventario sobre el mínimo.
              </p>
            ) : (
              stats.criticalProducts.map(p => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mínimo: {p.min_stock}</div>
                  </div>
                  <Badge variant="danger">Stock: {p.stock}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
