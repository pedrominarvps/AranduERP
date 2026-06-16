'use client';

import { useState } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { db } from '@/services/db';
import { InventoryView } from '@/components/inventory/InventoryView';
import type { Product } from '@/types/models';
import type { TaxRate } from '@/types/enums';

export default function InventoryPage() {
  const { products, categories, loadAllData } = useApp();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ barcode: '', name: '', description: '', category_id: '', cost_price: 0, sale_price: 0, tax_rate: 10, stock: 0, min_stock: 5 });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ barcode: product.barcode || '', name: product.name, description: product.description || '', category_id: product.category_id || '', cost_price: product.cost_price, sale_price: product.sale_price, tax_rate: product.tax_rate, stock: product.stock, min_stock: product.min_stock });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.saveProduct({ ...productForm, id: editingProduct?.id, cost_price: Number(productForm.cost_price), sale_price: Number(productForm.sale_price), tax_rate: Number(productForm.tax_rate) as TaxRate, stock: Number(productForm.stock), min_stock: Number(productForm.min_stock) });
      setIsProductModalOpen(false); setEditingProduct(null); await loadAllData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) { await db.deleteProduct(id); await loadAllData(); }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await db.saveCategory(categoryForm); setIsCategoryModalOpen(false); setCategoryForm({ name: '', description: '' }); await loadAllData(); }
    catch (err) { console.error(err); }
  };

  return (
    <>
      <InventoryView
        products={products} categories={categories}
        onEdit={handleEditProduct} onDelete={handleDeleteProduct}
        onAdd={() => { setEditingProduct(null); setProductForm({ barcode: '', name: '', description: '', category_id: categories[0]?.id || '', cost_price: 0, sale_price: 0, tax_rate: 10, stock: 0, min_stock: 5 }); setIsProductModalOpen(true); }}
        onManageCategories={() => setIsCategoryModalOpen(true)}
      />

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3 className="modal-title">{editingProduct ? 'Editar Producto' : 'Registrar Producto'}</h3><button className="modal-close" onClick={() => setIsProductModalOpen(false)}>×</button></div>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group"><label>Código de Barra</label><input type="text" className="form-input" placeholder="Escanee o ingrese código..." value={productForm.barcode} onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })} /></div>
              <div className="form-group"><label>Nombre del Producto</label><input type="text" className="form-input" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required /></div>
              <div className="form-group"><label>Descripción</label><input type="text" className="form-input" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></div>
              <div className="form-group"><label>Categoría</label><select className="form-input" value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} required><option value="">Seleccione...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}><label>Precio Costo (Gs.)</label><input type="number" className="form-input" value={productForm.cost_price} onChange={(e) => setProductForm({ ...productForm, cost_price: Number(e.target.value) })} required /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Precio Venta (Gs.)</label><input type="number" className="form-input" value={productForm.sale_price} onChange={(e) => setProductForm({ ...productForm, sale_price: Number(e.target.value) })} required /></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}><label>Tasa de IVA (%)</label><select className="form-input" value={productForm.tax_rate} onChange={(e) => setProductForm({ ...productForm, tax_rate: Number(e.target.value) })} required><option value={10}>10% (General)</option><option value={5}>5% (Reducido)</option><option value={0}>0% (Exento)</option></select></div>
                <div className="form-group" style={{ flex: 1 }}><label>Stock Inicial</label><input type="number" className="form-input" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} required /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Stock Mínimo</label><input type="number" className="form-input" value={productForm.min_stock} onChange={(e) => setProductForm({ ...productForm, min_stock: Number(e.target.value) })} required /></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsProductModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3 className="modal-title">Registrar Nueva Categoría</h3><button className="modal-close" onClick={() => setIsCategoryModalOpen(false)}>×</button></div>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group"><label>Nombre de Categoría</label><input type="text" className="form-input" placeholder="Bebidas, Lácteos..." value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required /></div>
              <div className="form-group"><label>Descripción</label><input type="text" className="form-input" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsCategoryModalOpen(false)}>Cerrar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
