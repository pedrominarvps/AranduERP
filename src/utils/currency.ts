import type { CartItem, CartTotals } from '../types/models';

export function formatPYG(value: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
  }).format(value).replace('PYG', 'Gs.');
}

export function calculateCartTotal(cart: CartItem[]): CartTotals {
  let subtotalExempt = 0;
  let subtotal5 = 0;
  let subtotal10 = 0;
  let total_iva_5 = 0;
  let total_iva_10 = 0;

  cart.forEach(item => {
    const itemTotal = item.sale_price * item.quantity;
    if (item.tax_rate === 10) {
      subtotal10 += itemTotal;
      total_iva_10 += Math.round(itemTotal / 11);
    } else if (item.tax_rate === 5) {
      subtotal5 += itemTotal;
      total_iva_5 += Math.round(itemTotal / 21);
    } else {
      subtotalExempt += itemTotal;
    }
  });

  const total = subtotalExempt + subtotal5 + subtotal10;
  const total_iva = total_iva_10 + total_iva_5;

  return {
    total,
    subtotalExempt,
    subtotal5,
    subtotal10,
    total_iva_5,
    total_iva_10,
    total_iva,
  };
}

export function generateInvoiceNumber(
  establishmentCode: string,
  pointOfSaleCode: string,
  sequence: number,
): string {
  const seqStr = sequence.toString().padStart(7, '0');
  return `${establishmentCode}-${pointOfSaleCode}-${seqStr}`;
}
