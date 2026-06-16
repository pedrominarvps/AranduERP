export function validateRUC(value: string): boolean {
  return /^\d{6,8}-\d$/.test(value);
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validatePhone(value: string): boolean {
  if (!value) return true;
  return /^[\d\s\-+()]{6,20}$/.test(value);
}

export function validateEmail(value: string): boolean {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
