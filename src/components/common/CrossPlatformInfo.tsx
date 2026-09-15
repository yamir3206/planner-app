import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Smartphone, Monitor, Tablet, Download, Upload, ShieldCheck, Zap, Globe, QrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
export function CrossPlatformInfo() {
  const navigate = useNavigate()
  return (
    <Card className="overflow-hidden border-0 shadow-medium bg-gradient-to-br from-card via-card to-primary/5">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white"><Globe className="h-4 w-4" /></div>یک حساب، همه جا<Badge variant="success" className="gap-1"><ShieldCheck className="h-3 w-3" />امن</Badge></CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-card p-3 text-center hover:shadow-soft hover:-translate-y-0.5 transition-all"><div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2"><Monitor className="h-5 w-5 text-primary" /></div><p className="text-xs font-bold">کامپیوتر</p><p className="text-[10px] text-muted-foreground mt-1">ویندوز، مک، لینوکس</p><Badge variant="secondary" className="mt-2 text-[10px]">مرورگر</Badge></div>
          <div className="rounded-2xl border bg-card p-3 text-center hover:shadow-soft hover:-translate-y-0.5 transition-all ring-2 ring-primary/20"><div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 text-white"><Smartphone className="h-5 w-5" /></div><p className="text-xs font-bold">موبایل</p><p className="text-[10px] text-muted-foreground mt-1">اندروید، آیفون</p><Badge className="mt-2 text-[10px]">فعال</Badge></div>
          <div className="rounded-2xl border bg-card p-3 text-center hover:shadow-soft hover:-translate-y-0.5 transition-all"><div className="mx-auto h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-2"><Tablet className="h-5 w-5 text-accent" /></div><p className="text-xs font-bold">تبلت</p><p className="text-[10px] text-muted-foreground mt-1">آیپد، اندروید</p><Badge variant="secondary" className="mt-2 text-[10px]">همراه</Badge></div>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />چطور در همه دستگاه‌ها با یک رمز وارد شوم؟</h4>
          <div className="grid gap-3">
            <div className="flex gap-3 rounded-xl bg-secondary/50 border p-3"><div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">۱</div><div className="flex-1"><p className="text-sm font-medium">در دستگاه اول ثبت‌نام کن</p><p className="text-xs text-muted-foreground mt-1">نام کاربری و رمزت را بساز و شروع به مطالعه کن</p></div></div>
            <div className="flex gap-3 rounded-xl bg-secondary/50 border p-3"><div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">۲</div><div className="flex-1"><p className="text-sm font-medium">پشتیبان بگیر</p><p className="text-xs text-muted-foreground mt-1">تنظیمات → پشتیبان‌گیری → ذخیره فایل یا نمایش QR</p><Button size="sm" variant="secondary" className="mt-2 h-7 text-xs" onClick={() => navigate('/settings')}><Download className="h-3 w-3" />پشتیبان</Button></div></div>
            <div className="flex gap-3 rounded-xl bg-secondary/50 border p-3"><div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">۳</div><div className="flex-1"><p className="text-sm font-medium">در دستگاه جدید وارد کن</p><p className="text-xs text-muted-foreground mt-1">فایل را بارگذاری کن یا QR را اسکن کن → با همان نام و رمز وارد شو</p><div className="flex gap-2 mt-2"><Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => navigate('/settings')}><Upload className="h-3 w-3" />فایل</Button><Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => navigate('/settings')}><QrCode className="h-3 w-3" />QR</Button></div></div></div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-3 flex gap-2"><ShieldCheck className="h-5 w-5 text-primary shrink-0" /><div className="text-xs leading-relaxed"><p className="font-bold">امن و خصوصی:</p><p className="text-muted-foreground mt-1">اطلاعاتت فقط روی دستگاه خودت ذخیره می‌شود. پشتیبان شامل همه چیز است و با همان رمز قبلی در همه جا کار می‌کند. بدون نیاز به اینترنت.</p></div></div>
      </CardContent>
    </Card>
  )
}
