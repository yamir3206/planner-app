import * as React from 'react'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { formatDuration } from '@/core/utils/date/timezone'

type Props = {
  progress: number
  remaining: number
  elapsed: number
  mode: 'pomodoro' | 'free' | 'countdown'
  isRunning: boolean
  isPaused: boolean
  isCompleted?: boolean
  subjectColor?: string
  subjectName?: string
  persianNumbers: boolean
  size?: number
}

export function CircularTimer({ progress, remaining, elapsed, mode, isRunning, isPaused, isCompleted, subjectColor, subjectName, persianNumbers, size = 320 }: Props) {
  const strokeWidth = 10
  const center = size / 2
  // دایره اصلی - با فاصله از لبه برای جلوگیری از برش
  const radius = (size - strokeWidth - 24) / 2
  const normalizedRadius = radius
  const circumference = 2 * Math.PI * normalizedRadius
  
  const isIdle = !isRunning && !isPaused && !isCompleted && elapsed === 0
  // برای حالت عادی، progress از 100 به 0 می‌رود، پس offset برعکس
  const strokeDashoffset = isIdle ? circumference : mode === 'free' ? 0 : circumference - (circumference * progress / 100)

  const displaySeconds = mode === 'free' ? elapsed : remaining
  const formatDisplay = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const gradientId = `timerGradient-${subjectName || 'default'}-${size}`

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG دایره - لایه پس‌زمینه */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="absolute inset-0 overflow-visible"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={subjectColor || '#6366F1'} stopOpacity={1} />
            <stop offset="100%" stopColor={subjectColor || '#06B6D4'} stopOpacity={0.9} />
          </linearGradient>
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* پس‌زمینه دایره - خاکستری کم‌رنگ */}
        <circle
          cx={center}
          cy={center}
          r={normalizedRadius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />

        {/* دایره پیشرفت */}
        {mode !== 'free' ? (
          <circle
            cx={center}
            cy={center}
            r={normalizedRadius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ 
              filter: isRunning ? `url(#glow-${gradientId})` : undefined,
            }}
          />
        ) : (
          <>
            <circle
              cx={center}
              cy={center}
              r={normalizedRadius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={isIdle ? 0.2 : 0.9}
              className="transition-opacity duration-500"
            />
            {isRunning && (
              <circle
                cx={center}
                cy={center - normalizedRadius}
                r={5}
                fill={subjectColor || '#6366F1'}
                filter={`url(#glow-${gradientId})`}
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${center} ${center}`}
                  to={`360 ${center} ${center}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </>
        )}
      </svg>

      {/* محتوای وسط - کاملاً جدا از SVG و در مرکز دقیق */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none">
        {/* عدد اصلی تایمر - وسط دایره */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="font-black tabular-nums tracking-tight leading-none select-none"
            dir="ltr"
            style={{ 
              fontSize: size < 280 ? '2.5rem' : size < 320 ? '3rem' : '3.5rem',
              color: isCompleted ? 'hsl(var(--success))' : 'hsl(var(--foreground))',
              textShadow: '0 2px 8px rgba(0,0,0,0.04)',
              lineHeight: '1',
            }}
          >
            {persianNumbers ? toPersianDigits(formatDisplay(displaySeconds)) : formatDisplay(displaySeconds)}
          </div>

          {/* وضعیت */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {isRunning && <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />}
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
              isRunning ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
              isPaused ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
              'bg-gray-50 text-gray-500 border border-gray-200'
            }`}>
              {isCompleted ? '✓ تمام شد' : isRunning ? 'در حال مطالعه' : isPaused ? 'متوقف' : 'آماده'}
            </span>
          </div>

          {/* زمان گذشته */}
          {elapsed > 0 && !isIdle && (
            <div className="text-[10px] text-muted-foreground mt-1">
              {formatDuration(elapsed, persianNumbers, false)} گذشته
            </div>
          )}

          {/* نام درس */}
          {subjectName && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: subjectColor }} />
              <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[120px]">{subjectName}</span>
            </div>
          )}
        </div>
      </div>

      {/* نشان حالت - خارج از دایره، بالا */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
        <div className="px-2.5 py-1 rounded-full bg-foreground text-background text-[10px] font-bold shadow-md whitespace-nowrap">
          {mode === 'pomodoro' ? '🍅 متمرکز' : mode === 'countdown' ? '⏱ زمان‌دار' : '📚 آزاد'}
        </div>
      </div>
    </div>
  )
}
