import * as React from 'react'
import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'xl'
  loading?: boolean
}

const variantStyles = {
  primary: 'bg-gradient-to-br from-primary to-accent text-white hover:shadow-large hover:scale-[1.02] active:scale-[0.98] shadow-soft font-bold',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98] border font-medium',
  ghost: 'hover:bg-accent/10 hover:text-accent-foreground active:scale-[0.98] font-medium',
  outline: 'border-2 border-input bg-card hover:bg-accent hover:text-accent-foreground active:scale-[0.98] font-medium shadow-soft',
  danger: 'bg-gradient-to-br from-destructive to-red-600 text-white hover:shadow-medium active:scale-[0.98] shadow-soft font-bold',
  success: 'bg-gradient-to-br from-success to-emerald-600 text-white hover:shadow-medium active:scale-[0.98] shadow-soft font-bold'
}

const sizeStyles = {
  sm: 'h-9 px-3 text-sm rounded-xl min-h-[36px]',
  md: 'h-11 px-5 text-[15px] rounded-xl min-h-[44px]',
  lg: 'h-[52px] px-8 text-base rounded-2xl min-h-[52px]',
  xl: 'h-16 px-10 text-lg rounded-2xl min-h-[64px] shadow-medium',
  icon: 'h-11 w-11 rounded-xl'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'touch-target select-none',
          'tracking-tight',
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
