import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-2xl'
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  React.useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 modal-backdrop animate-fade-in" onClick={onClose} aria-hidden />
      
      {/* Content */}
      <div
        className={cn(
          'relative z-10 w-full bg-card rounded-t-3xl sm:rounded-2xl shadow-large',
          'animate-scale-in max-h-[90vh] overflow-hidden flex flex-col',
          'border-t sm:border',
          sizeStyles[size],
          'mx-0 sm:mx-4'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b">
            <div className="flex-1">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold leading-none">
                  {title}
                </h2>
              )}
              {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mt-1">
              <X className="h-4 w-4" />
              <span className="sr-only">بستن</span>
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-6 pt-0', className)} {...props} />
}
