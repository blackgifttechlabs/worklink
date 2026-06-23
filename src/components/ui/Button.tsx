import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const variants = { primary: 'bg-[#fb7152] text-white hover:bg-[#e86043] shadow-sm', secondary: 'bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm', outline: 'border-2 border-white text-white hover:bg-white/10', ghost: 'hover:bg-gray-100 text-gray-700 hover:text-brand-navy', link: 'text-brand-navy underline-offset-4 hover:underline' };
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-6 text-base', lg: 'h-14 px-8 text-lg font-medium', icon: 'h-11 w-11' };
  return <button ref={ref} className={cn('inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)} {...props}>{isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}{children}</button>;
});
Button.displayName = 'Button';
