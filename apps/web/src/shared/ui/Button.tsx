import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-foam text-white hover:bg-foam-dark disabled:bg-muted/40',
  secondary: 'border border-line bg-surface text-ink hover:border-foam disabled:text-muted',
  quiet: 'text-foam-dark underline-offset-4 hover:underline disabled:text-muted',
  danger: 'bg-status-grace text-white hover:opacity-90 disabled:opacity-50',
};

/** Button look, also for links that act like buttons (e.g. the WhatsApp link). */
export const buttonClasses = (variant: ButtonVariant = 'primary', extra = '') =>
  `inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-semibold disabled:cursor-not-allowed ${VARIANTS[variant]} ${extra}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...rest} />;
}
