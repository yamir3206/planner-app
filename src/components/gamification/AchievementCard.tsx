import * as React from 'react'
import { Achievement } from '@/core/domain/models/Gamification'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { Badge } from '@/components/ui/Badge'

type Props = {
  achievement: Achievement
  persianNumbers?: boolean
}

const rarityConfig = {
  common: { bg: 'from-gray-400 to-gray-500', border: 'border-gray-200', label: 'معمولی', color: 'bg-gray-100 text-gray-700' },
  rare: { bg: 'from-blue-400 to-cyan-500', border: 'border-blue-200', label: 'کمیاب', color: 'bg-blue-100 text-blue-700' },
  epic: { bg: 'from-purple-400 to-pink-500', border: 'border-purple-200', label: 'حماسی', color: 'bg-purple-100 text-purple-700' },
  legendary: { bg: 'from-amber-400 to-orange-500', border: 'border-amber-200', label: 'افسانه‌ای', color: 'bg-amber-100 text-amber-700' },
}

export function AchievementCard({ achievement, persianNumbers = true }: Props) {
  const isUnlocked = !!achievement.unlockedAt
  const progress = achievement.progress || 0
  const progressPercent = Math.min(100, (progress / achievement.requirement) * 100)
  const rarity = rarityConfig[achievement.rarity]
  
  return (
    <div className={`relative rounded-2xl border-2 p-4 transition-all duration-300 ${
      isUnlocked 
        ? `${rarity.border} bg-gradient-to-br from-card to-primary/5 shadow-medium hover:shadow-large hover:-translate-y-1` 
        : 'border-border bg-card/50 opacity-60'
    }`}>
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-success text-white flex items-center justify-center text-xs font-black shadow-soft">
          ✓
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-soft shrink-0 ${
          isUnlocked ? `bg-gradient-to-br ${rarity.bg} text-white` : 'bg-secondary text-muted-foreground'
        }`}>
          {achievement.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm truncate">{achievement.title}</h4>
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${rarity.color}`}>
              {rarity.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
          
          <div className="mt-3 space-y-2">
            {!isUnlocked ? (
              <>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{persianNumbers ? toPersianDigits(`${progress} / ${achievement.requirement}`) : `${progress}/${achievement.requirement}`}</span>
                  <span>{persianNumbers ? toPersianDigits(`${Math.round(progressPercent)}٪`) : `${Math.round(progressPercent)}%`}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-bold">
                  +{persianNumbers ? toPersianDigits(achievement.xpReward.toString()) : achievement.xpReward} XP
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  +{persianNumbers ? toPersianDigits(achievement.coinReward.toString()) : achievement.coinReward} 🪙
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AchievementGrid({ achievements, persianNumbers = true, filter }: { 
  achievements: Achievement[]
  persianNumbers?: boolean
  filter?: Achievement['category']
}) {
  const filtered = filter ? achievements.filter(a => a.category === filter) : achievements
  const unlocked = filtered.filter(a => a.unlockedAt)
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">
          {filter ? (
            filter === 'study' ? 'مطالعه' :
            filter === 'streak' ? 'پیوستگی' :
            filter === 'tasks' ? 'کارها' :
            filter === 'time' ? 'زمان' : 'ویژه'
          ) : 'همه دستاوردها'}
        </h3>
        <span className="text-xs text-muted-foreground">
          {persianNumbers ? toPersianDigits(`${unlocked.length} / ${filtered.length}`) : `${unlocked.length}/${filtered.length}`}
        </span>
      </div>
      
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {filtered.map(ach => (
          <AchievementCard key={ach.id} achievement={ach} persianNumbers={persianNumbers} />
        ))}
      </div>
    </div>
  )
}
