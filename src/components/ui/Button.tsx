import * as React from 'react'
import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const variantStyles = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft hover:shadow-medium active:scale-[0.98]',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
  ghost: 'hover:bg-accent/10 hover:text-accent-foreground active:scale-[0.98]',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft active:scale-[0.98]'
}

const sizeStyles = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-[15px] rounded-xl',
  lg: 'h-13 px-8 text-base rounded-xl min-h-[52px]',
  icon: 'h-11 w-11 rounded-xl'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'touch-target select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
