import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  iconOnly?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'secondary', iconOnly, children, className = '', ...props }: ButtonProps) {
  const variantClass = `btn-${variant}`;
  const iconOnlyClass = iconOnly ? 'btn-icon-only' : '';
  return (
    <button className={`btn ${variantClass} ${iconOnlyClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
