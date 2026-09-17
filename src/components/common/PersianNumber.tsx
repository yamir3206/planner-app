import * as React from 'react'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { useSettingsStore } from '@/app/providers'

interface PersianNumberProps {
  value: string | number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function PersianNumber({ value, className, as: Component = 'span' }: PersianNumberProps) {
  const { settings } = useSettingsStore()
  const display = settings.persianNumbers ? toPersianDigits(String(value)) : String(value)
  
  return React.createElement(Component, { className, dir: 'ltr' }, display)
}

export function usePersianNumber() {
  const { settings } = useSettingsStore()
  return React.useCallback(
    (value: string | number) => {
      return settings.persianNumbers ? toPersianDigits(String(value)) : String(value)
    },
    [settings.persianNumbers]
  )
}
