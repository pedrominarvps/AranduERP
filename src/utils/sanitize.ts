export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeForCss(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s\-_áéíóúñüÁÉÍÓÚÑÜ,.]/g, '');
}

export function sanitizeForHtmlAttr(input: string): string {
  return input.replace(/["'<>`]/g, '');
}

export function stripHtml(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=\s*["']?[^"'\s>]+/gi, '')
    .trim();
}

export function validatePin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export function validateRuc(ruc: string): boolean {
  return /^\d{6,8}-\d$/.test(ruc.trim());
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  return /^[\d\s\-+()]{6,20}$/.test(phone.trim());
}
