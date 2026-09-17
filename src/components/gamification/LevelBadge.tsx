import * as React from 'react'
import { Level, getLevelFromXp, getNextLevel } from '@/core/domain/models/Gamification'
import { toPersianDigits } from '@/core/utils/persian/numbers'

type Props = {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  persianNumbers?: boolean
}

export function LevelBadge({ xp, size = 'md', showProgress = true, persianNumbers = true }: Props) {
  const level = getLevelFromXp(xp)
  const nextLevel = getNextLevel(xp)
  
  const progress = nextLevel 
    ? ((xp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100
    : 100
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-2xl',
  }
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div 
          className={`rounded-2xl flex items-center justify-center font-black text-white shadow-medium ${sizeClasses[size]}`}
          style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}CC)` }}
        >
          {level.icon}
        </div>
        {showProgress && nextLevel && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm">{level.title}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {persianNumbers ? toPersianDigits(`سطح ${level.level}`) : `Lv ${level.level}`}
          </span>
        </div>
        {showProgress && nextLevel && (
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {persianNumbers 
              ? toPersianDigits(`${xp - level.minXp} / ${nextLevel.minXp - level.minXp} XP`)
              : `${xp - level.minXp} / ${nextLevel.minXp - level.minXp} XP`
            }
          </div>
        )}
      </div>
    </div>
  )
}

export function LevelProgress({ xp, persianNumbers = true }: { xp: number; persianNumbers?: boolean }) {
  const level = getLevelFromXp(xp)
  const nextLevel = getNextLevel(xp)
  
  if (!nextLevel) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-4 text-white text-center">
        <div className="text-2xl mb-1">🏆</div>
        <div className="font-black">حداکثر سطح!</div>
        <div className="text-xs opacity-90">تو افسانه‌ای هستی</div>
      </div>
    )
  }
  
  const progress = ((xp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100
  const remaining = nextLevel.minXp - xp
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{level.icon}</span>
          <span className="font-bold text-sm">{level.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">→</span>
          <span className="text-lg">{nextLevel.icon}</span>
          <span className="font-bold text-sm">{nextLevel.title}</span>
        </div>
      </div>
      
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white drop-shadow">
            {persianNumbers ? toPersianDigits(`${Math.round(progress)}٪`) : `${Math.round(progress)}%`}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{persianNumbers ? toPersianDigits(`${xp} XP`) : `${xp} XP`}</span>
        <span>{persianNumbers ? toPersianDigits(`${remaining} تا سطح بعد`) : `${remaining} to next`}</span>
      </div>
    </div>
  )
}
