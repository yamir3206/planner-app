import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useSettingsStore } from '@/app/providers'
import { analyticsService, DailyStat } from '@/core/services/analyticsService'
import { useSubjects } from '@/hooks/useSubjects'
import { formatJalali } from '@/core/utils/date/jalali'
import { formatDuration, formatMinutes } from '@/core/utils/date/timezone'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Award, Clock, BookOpen, Calendar } from 'lucide-react'

export function AnalyticsPage() {
  const { settings } = useSettingsStore()
  const { subjects, load: loadSubjects } = useSubjects()
  const [dailyStats, setDailyStats] = React.useState<DailyStat[]>([])
  const [subjectDist, setSubjectDist] = React.useState<{ subjectId: string; duration: number; sessions: number }[]>([])
  const [bestDay, setBestDay] = React.useState<{ date: string; duration: number } | null>(null)
  const [avgTime, setAvgTime] = React.useState(0)

  React.useEffect(() => {
    loadSubjects()
    analyticsService.getDailyStats(7).then(setDailyStats)
    analyticsService.getSubjectDistribution().then(setSubjectDist)
    analyticsService.getBestDay().then(setBestDay)
    analyticsService.getAverageStudyTime().then(setAvgTime)
  }, [loadSubjects])

  const chartData = dailyStats.map(stat => ({
    name: formatJalali(new Date(stat.date)).split(' ')[0],
    minutes: Math.round(stat.duration / 60),
    date: stat.date
  }))

  const pieData = subjectDist.map(item => {
    const subject = subjects.find(s => s.id === item.subjectId)
    return {
      name: subject?.name || 'نامشخص',
      value: Math.round(item.duration / 60),
      color: subject?.color || '#6366F1'
    }
  })

  const totalWeekMinutes = dailyStats.reduce((sum, s) => sum + s.duration, 0) / 60

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">آمار و تحلیل</h1>

      {/* Summary */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              مجموع هفته
            </div>
            <p className="text-lg font-bold mt-1">{formatMinutes(Math.round(totalWeekMinutes), settings.persianNumbers)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              میانگین روزانه
            </div>
            <p className="text-lg font-bold mt-1">{formatDuration(avgTime, settings.persianNumbers, false)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              بهترین روز
            </div>
            <p className="text-sm font-bold mt-1">{bestDay ? formatJalali(new Date(bestDay.date)) : '—'}</p>
            <p className="text-xs text-muted-foreground">{bestDay ? formatDuration(bestDay.duration, settings.persianNumbers, false) : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              دروس فعال
            </div>
            <p className="text-lg font-bold mt-1">{toPersianDigits(subjectDist.length.toString())} درس</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              مطالعه روزانه (7 روز اخیر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontFamily: 'Vazirmatn', fontSize: 12 }} />
                    <YAxis tick={{ fontFamily: 'Vazirmatn', fontSize: 12 }} tickFormatter={(v) => settings.persianNumbers ? toPersianDigits(v.toString()) : v.toString()} />
                    <Tooltip
                      formatter={(value: number) => [formatMinutes(value, settings.persianNumbers), 'مطالعه']}
                      labelFormatter={(label) => `روز ${label}`}
                      contentStyle={{ fontFamily: 'Vazirmatn', direction: 'rtl', borderRadius: '12px' }}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-12">داده‌ای برای نمایش وجود ندارد</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subject distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              توزیع دروس
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatMinutes(value, settings.persianNumbers), '']} contentStyle={{ fontFamily: 'Vazirmatn', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-12">هنوز جلسه‌ای ثبت نشده</p>
              )}
            </div>
            {pieData.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}: {toPersianDigits(item.value.toString())} دقیقه
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">جزئیات روزانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyStats.slice().reverse().map(stat => (
              <div key={stat.date} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium text-sm">{formatJalali(new Date(stat.date), { includeWeekday: true })}</p>
                  <p className="text-xs text-muted-foreground">{toPersianDigits(stat.sessions.toString())} جلسه • {toPersianDigits(stat.tasks.toString())} کار</p>
                </div>
                <div className="text-sm font-bold">{formatDuration(stat.duration, settings.persianNumbers, false)}</div>
              </div>
            ))}
            {dailyStats.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">داده‌ای وجود ندارد</p>}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
