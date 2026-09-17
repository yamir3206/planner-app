import * as React from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  dirAuto?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, dirAuto = true, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`
    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          dir={dirAuto ? 'auto' : undefined}
          className={cn(
            'flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2',
            'text-[15px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2)}`
    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          dir="auto"
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border border-input bg-background px-4 py-3',
            'text-[15px] ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            error && 'border-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id || `select-${Math.random().toString(36).slice(2)}`
    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          id={inputId}
          className={cn(
            'flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2',
            'text-[15px] ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
