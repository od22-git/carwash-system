import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-foam text-white hover:bg-foam-dark disabled:bg-muted/40',
  secondary: 'border border-line bg-surface text-ink hover:border-foam disabled:text-muted',
  quiet: 'text-foam-dark underline-offset-4 hover:underline disabled:text-muted',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-lg px-5 py-2.5 font-semibold disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
