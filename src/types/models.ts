import type { TaxRate } from './enums';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string;
  category_id: string;
  cost_price: number;
  sale_price: number;
  tax_rate: TaxRate;
  stock: number;
  min_stock: number;
}

export interface Sale {
  id: string;
  invoice_number: string;
  timbrado: string;
  customer_id: string;
  customer_name: string;
  customer_ruc: string;
  total: number;
  total_iva_5: number;
  total_iva_10: number;
  total_exempt: number;
  payment_method: string;
  received_amount: number;
  change_amount: number;
  created_at: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: TaxRate;
  subtotal: number;
}

export interface Customer {
  id: string;
  ruc: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  ruc: string;
  phone: string;
  address: string;
  timbrado_number: string;
  timbrado_start_date: string;
  timbrado_end_date: string;
  establishment_code: string;
  point_of_sale_code: string;
  current_invoice_sequence: number;
  receipt_footer: string;
  access_pin?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartTotals {
  total: number;
  subtotalExempt: number;
  subtotal5: number;
  subtotal10: number;
  total_iva_5: number;
  total_iva_10: number;
  total_iva: number;
}
