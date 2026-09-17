import * as React from 'react'
import { toPersianDigits } from '@/core/utils/persian/numbers'

type Props = {
  xp: number
  reason: string
  icon: string
  persianNumbers?: boolean
  onClose: () => void
}

export function XpToast({ xp, reason, icon, persianNumbers = true, onClose }: Props) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 duration-300">
      <div className="rounded-2xl bg-foreground text-background px-4 py-3 shadow-large flex items-center gap-3 border">
        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg font-black shadow-soft animate-bounce">
          {icon}
        </div>
        <div>
          <div className="font-black text-sm flex items-center gap-1.5">
            <span className="text-primary">+{persianNumbers ? toPersianDigits(xp.toString()) : xp} XP</span>
            <span className="text-xs opacity-70">{reason}</span>
          </div>
          <div className="text-[11px] opacity-60">امتیاز گرفتی!</div>
        </div>
      </div>
    </div>
  )
}

export function LevelUpModal({ newLevel, title, icon, persianNumbers = true, onClose }: { 
  newLevel: number
  title: string
  icon: string
  persianNumbers?: boolean
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-large animate-in zoom-in-95 duration-300 border">
        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-large animate-bounce mb-4">
          {icon}
        </div>
        
        <h2 className="text-2xl font-black">سطح جدید!</h2>
        <p className="text-muted-foreground text-sm mt-2">
          به سطح {persianNumbers ? toPersianDigits(newLevel.toString()) : newLevel} رسیدی
        </p>
        
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4">
          <div className="font-black text-lg">{title}</div>
          <div className="text-xs text-muted-foreground mt-1">عنوان جدیدت</div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-secondary p-3">
            <div className="text-lg">⭐</div>
            <div className="text-[11px] font-bold mt-1">امتیاز بیشتر</div>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <div className="text-lg">🎨</div>
            <div className="text-[11px] font-bold mt-1">تم جدید</div>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <div className="text-lg">🏅</div>
            <div className="text-[11px] font-bold mt-1">نشان ویژه</div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary text-white font-bold py-3 shadow-medium hover:shadow-large transition-all"
        >
          عالیه! 🚀
        </button>
      </div>
    </div>
  )
}

export function AchievementUnlock({ achievement, persianNumbers = true, onClose }: { 
  achievement: { title: string; icon: string; xpReward: number; coinReward: number }
  persianNumbers?: boolean
  onClose: () => void
}) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 p-[2px] shadow-large">
        <div className="rounded-[22px] bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-medium animate-bounce">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-amber-600">🏆 دستاورد جدید!</div>
              <div className="font-black text-sm mt-0.5">{achievement.title}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  +{persianNumbers ? toPersianDigits(achievement.xpReward.toString()) : achievement.xpReward} XP
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  +{persianNumbers ? toPersianDigits(achievement.coinReward.toString()) : achievement.coinReward} 🪙
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
