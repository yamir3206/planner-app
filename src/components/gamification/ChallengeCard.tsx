import * as React from 'react'
import { DailyChallenge } from '@/core/domain/models/Gamification'
import { toPersianDigits } from '@/core/utils/persian/numbers'

type Props = {
  challenge: DailyChallenge
  persianNumbers?: boolean
}

export function ChallengeCard({ challenge, persianNumbers = true }: Props) {
  const progress = Math.min(100, (challenge.progress / challenge.target) * 100)
  const isCompleted = challenge.completed
  
  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      isCompleted 
        ? 'bg-gradient-to-br from-success/5 to-emerald-500/5 border-success/20 shadow-soft' 
        : 'bg-card border-border hover:shadow-soft hover:border-primary/20'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
          isCompleted ? 'bg-success text-white shadow-soft' : 'bg-primary/10 text-primary'
        }`}>
          {isCompleted ? '✓' : challenge.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm">{challenge.title}</h4>
            {isCompleted && <span className="text-success text-xs">✓</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
          
          <div className="mt-3 space-y-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isCompleted ? 'bg-success' : 'bg-primary'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {persianNumbers 
                  ? toPersianDigits(`${challenge.progress} / ${challenge.target}`)
                  : `${challenge.progress}/${challenge.target}`
                }
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                  +{persianNumbers ? toPersianDigits(challenge.xpReward.toString()) : challenge.xpReward} XP
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                  +{persianNumbers ? toPersianDigits(challenge.coinReward.toString()) : challenge.coinReward} 🪙
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DailyChallenges({ challenges, persianNumbers = true }: { 
  challenges: DailyChallenge[]
  persianNumbers?: boolean
}) {
  const completed = challenges.filter(c => c.completed).length
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs">🎯</span>
          چالش‌های امروز
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          completed === challenges.length 
            ? 'bg-success/10 text-success border border-success/20' 
            : 'bg-secondary text-muted-foreground'
        }`}>
          {persianNumbers ? toPersianDigits(`${completed} / ${challenges.length}`) : `${completed}/${challenges.length}`}
        </span>
      </div>
      
      <div className="grid gap-3">
        {challenges.map(ch => (
          <ChallengeCard key={ch.id} challenge={ch} persianNumbers={persianNumbers} />
        ))}
      </div>
      
      {completed === challenges.length && challenges.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-success to-emerald-600 p-4 text-white text-center shadow-medium">
          <div className="text-2xl mb-1">🎉</div>
          <div className="font-black text-sm">همه چالش‌ها کامل شد!</div>
          <div className="text-xs opacity-90 mt-1">فردا چالش‌های جدید میاد</div>
        </div>
      )}
    </div>
  )
}
