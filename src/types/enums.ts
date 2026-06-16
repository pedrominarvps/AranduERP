export type TaxRate = 0 | 5 | 10;
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia';
export type ReceiptType = 'ticket' | 'factura';
export type TabName = 'dashboard' | 'pos' | 'inventory' | 'sales' | 'customers' | 'settings';

export const TAX_RATES = {
  EXEMPT: 0 as TaxRate,
  REDUCED: 5 as TaxRate,
  GENERAL: 10 as TaxRate,
} as const;

export const PAYMENT_METHODS: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'Transferencia'];
export const RECEIPT_TYPES: ReceiptType[] = ['ticket', 'factura'];
