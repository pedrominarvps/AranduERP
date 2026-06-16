import { Search } from 'lucide-react';
import type { Product, Category } from '../../types/models';
import { formatPYG } from '../../utils/currency';
import { Badge } from '../ui/Badge';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  posSearch: string;
  selectedCategoryId: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (id: string) => void;
  onProductSelect: (product: Product) => void;
  onBarcodeSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function ProductGrid({
  products, categories, posSearch, selectedCategoryId,
  onSearchChange, onCategoryChange, onProductSelect,
  onBarcodeSubmit, inputRef,
}: ProductGridProps) {
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(posSearch));
    const matchesCategory = selectedCategoryId === 'all' || p.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pos-products-panel">
      <form onSubmit={onBarcodeSubmit} className="pos-search-bar">
        <div className="scanner-wrapper">
          <Search className="scanner-icon" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="scanner-input"
            placeholder="Escanee código o busque por nombre y presione Enter..."
            value={posSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      <div className="categories-scroll">
        <span
          className={`category-pill ${selectedCategoryId === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          Todos
        </span>
        {categories.map(c => (
          <span
            key={c.id}
            className={`category-pill ${selectedCategoryId === c.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(c.id)}
          >
            {c.name}
          </span>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No se encontraron productos disponibles.
          </div>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id} className="product-pos-card" onClick={() => onProductSelect(p)}>
              <Badge
                variant={p.tax_rate === 0 ? 'success' : p.tax_rate === 5 ? 'warning' : 'amber'}
                className="iva-badge"
              >
                IVA {p.tax_rate}%
              </Badge>
              <div>
                <div className="product-pos-title">{p.name}</div>
                <div className="product-pos-barcode">{p.barcode || 'S/C'}</div>
              </div>
              <div>
                <div className="product-pos-stock" style={{ color: p.stock <= p.min_stock ? 'var(--crimson)' : 'var(--text-3)' }}>
                  Stock: {p.stock}
                </div>
                <div className="product-pos-price">{formatPYG(p.sale_price)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
