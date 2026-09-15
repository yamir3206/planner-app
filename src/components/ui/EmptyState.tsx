import * as React from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12 px-6 text-center', className)}>
      {Icon && (
        <div className="rounded-2xl bg-secondary p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="primary" size="sm" className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  )
}
