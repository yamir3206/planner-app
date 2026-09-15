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
  const radius = 130
  const strokeWidth = 12
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  
  const isIdle = !isRunning && !isPaused && !isCompleted && elapsed === 0
  const strokeDashoffset = isIdle ? 0 : mode === 'free' ? 0 : circumference * (progress / 100)

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
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={subjectColor || 'hsl(var(--primary))'} stopOpacity={1} />
            <stop offset="100%" stopColor={subjectColor || 'hsl(var(--accent))'} stopOpacity={0.9} />
          </linearGradient>
        </defs>

        {/* پس‌زمینه دایره */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />

        {/* دایره اصلی - با چرخش -90 درجه برای شروع از بالا */}
        <g transform={`rotate(-90 ${size/2} ${size/2})`}>
          {mode !== 'free' ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={normalizedRadius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{ 
                filter: isRunning ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' : undefined,
              }}
            />
          ) : (
            // حالت آزاد - دایره ثابت، نقطه چرخان جداگانه
            <>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={normalizedRadius}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={0}
                strokeLinecap="round"
                opacity={isIdle ? 0.3 : 0.8}
              />
              {isRunning && (
                <circle
                  cx={size / 2}
                  cy={size / 2 - normalizedRadius}
                  r={6}
                  fill={subjectColor || 'hsl(var(--primary))'}
                  className="drop-shadow-md"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${size/2} ${size/2}`}
                    to={`360 ${size/2} ${size/2}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </>
          )}
        </g>

        {/* نشانه‌های ساعت - 60 عدد، بدون چرخش */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i * 6 - 90) * Math.PI / 180
          const isHour = i % 5 === 0
          const tickLength = isHour ? 12 : 5
          const r1 = normalizedRadius + strokeWidth / 2 + 6
          const r2 = r1 + tickLength
          const x1 = size / 2 + r1 * Math.cos(angle)
          const y1 = size / 2 + r1 * Math.sin(angle)
          const x2 = size / 2 + r2 * Math.cos(angle)
          const y2 = size / 2 + r2 * Math.sin(angle)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isHour ? 'hsl(var(--muted-foreground))' : 'hsl(var(--border))'} strokeWidth={isHour ? 2 : 1} opacity={isHour ? 0.6 : 0.3} />
        })}
      </svg>

      {/* محتوای وسط - همیشه خوانا با پس‌زمینه شفاف */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center space-y-3 bg-card/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-soft border">
          <div
            className="text-5xl md:text-6xl font-black tabular-nums tracking-tight leading-none text-foreground"
            dir="ltr"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.05)',
              color: isCompleted ? 'hsl(var(--success))' : 'hsl(var(--foreground))'
            }}
          >
            {persianNumbers ? toPersianDigits(formatDisplay(displaySeconds)) : formatDisplay(displaySeconds)}
          </div>

          <div className="flex items-center justify-center gap-2">
            {isRunning && <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 
              isRunning ? 'bg-blue-50 text-blue-700 border-blue-200' : 
              isPaused ? 'bg-amber-50 text-amber-700 border-amber-200' : 
              'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {isCompleted ? 'تمام شد!' : isRunning ? 'در حال مطالعه' : isPaused ? 'متوقف شده' : 'آماده'}
            </span>
          </div>

          {elapsed > 0 && !isIdle && (
            <div className="text-[11px] text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-full">
              گذشته: {formatDuration(elapsed, persianNumbers, false)}
            </div>
          )}

          {subjectName && (
            <div className="flex items-center justify-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: subjectColor }} />
              <span className="text-xs font-medium text-muted-foreground">{subjectName}</span>
            </div>
          )}
        </div>
      </div>

      {/* نشان حالت */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <div className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-md">
          {mode === 'pomodoro' ? '🍅 متمرکز' : mode === 'countdown' ? '⏱️ زمان‌دار' : '📚 آزاد'}
        </div>
      </div>
    </div>
  )
}
