import * as React from 'react'
import { cn } from '@/lib/cn'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning'
  showLabel?: boolean
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning'
}

export function Progress({ className, value, size = 'md', variant = 'default', showLabel, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('flex w-full items-center gap-3', className)} {...props}>
      <div className={cn('w-full overflow-hidden rounded-full bg-secondary', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantStyles[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-sm font-medium text-muted-foreground">{Math.round(clamped)}٪</span>}
    </div>
  )
}

export interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

export function CircularProgress({ value, size = 80, strokeWidth = 6, className, showLabel = true }: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-bold">{Math.round(clamped)}٪</span>
      )}
    </div>
  )
}
