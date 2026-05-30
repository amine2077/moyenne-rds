'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SUBJECTS, TRANSLATIONS, Lang } from '@/lib/data'
import { calculateS2, calculateAnnual } from '@/lib/calculator'
import { Sun, Moon, Languages, Trash2, Calculator, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import posthog from 'posthog-js'

function ConfettiEffect({ count = 50 }: { count?: number }) {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
  const particles = Array.from({ length: count }).map((_, i) => {
    const left = Math.random() * 100
    const delay = Math.random() * 3
    const duration = 2 + Math.random() * 3
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = 6 + Math.random() * 8
    const rotate = Math.random() * 360
    return { id: i, left, delay, duration, color, size, rotate }
  })

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px] animate-confetti-fall rounded-sm"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * (Math.random() > 0.5 ? 1.5 : 1)}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0.8,
            willChange: 'transform',
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      ` }} />
    </div>
  )
}

// ── Reusable logo with fallback ──────────────────────────────────────────────
function UnivLogo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="flex flex-col items-center gap-1">
      {!failed && (
        <img
          src="/univ-logo.png"
          alt="Université Tlemcen"
          className={`object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105 ${className ?? 'w-20 h-auto'}`}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className={`flex items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 ${className ?? 'w-20 h-20'}`}>
          <span className="font-mono text-[9px] font-bold text-indigo-500 text-center leading-tight px-1">
            UNIV<br />TLEMCEN
          </span>
        </div>
      )}
    </div>
  )
}

function playSuccessSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Elegant ascending arpeggio chime (C5 -> E5 -> G5 -> C6 -> E6)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Mix a sine wave for warmth and triangle wave for a chime/bell clarity
      osc.type = index % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now + index * 0.08)

      // Envelope to fade out each note smoothly
      gain.gain.setValueAtTime(0.08, now + index * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + index * 0.08)
      osc.stop(now + index * 0.08 + 0.5)
    })
  } catch (e) {
    console.error('Failed to play success sound:', e)
  }
}

export default function GradeCalculator() {
  const { theme, setTheme } = useTheme()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  
  // States for inputs
  const [s1Value, setS1Value] = useState<string>('')
  const [grades, setGrades] = useState<{ cc: string; exam: string }[]>(
    SUBJECTS.map(() => ({ cc: '', exam: '' }))
  )
  
  // States for calculated values
  const [s2Average, setS2Average] = useState<number | null>(null)
  const [annualAvg, setAnnualAvg] = useState<number | null>(null)
  const [filledCount, setFilledCount] = useState<number>(0)
  const [bestGrade, setBestGrade] = useState<number | null>(null)
  const [lowestGrade, setLowestGrade] = useState<number | null>(null)
  const [usedCoeff, setUsedCoeff] = useState<number>(0)
  const [subjectMoys, setSubjectMoys] = useState<(number | null)[]>(SUBJECTS.map(() => null))

  // Confetti & Calculation state
  const [showConfetti, setShowConfetti] = useState(false)
  const [isCalculated, setIsCalculated] = useState(false)
  const [errors, setErrors] = useState<{
    s1: boolean
    subjects: { cc: boolean; exam: boolean }[]
  }>({ s1: false, subjects: SUBJECTS.map(() => ({ cc: false, exam: false })) })

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('lang') as Lang
    if (savedLang) setLang(savedLang)
    
    const savedS1 = localStorage.getItem('s1Value')
    if (savedS1) setS1Value(savedS1)

    const savedGrades = localStorage.getItem('grades')
    if (savedGrades) {
      try {
        setGrades(JSON.parse(savedGrades))
      } catch (e) {
        console.error('Failed to parse saved grades', e)
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('s1Value', s1Value)
    localStorage.setItem('grades', JSON.stringify(grades))

    const result = calculateS2(grades)
    setS2Average(result.s2Average)
    setFilledCount(result.filled)
    setBestGrade(result.best)
    setLowestGrade(result.worst)
    setUsedCoeff(result.usedCoeff)
    setSubjectMoys(result.subjectMoys)

    const s1Num = s1Value !== '' && !isNaN(parseFloat(s1Value)) ? parseFloat(s1Value) : null
    const annual = calculateAnnual(s1Num, result.s2Average)
    setAnnualAvg(annual)
  }, [s1Value, grades, mounted])

  useEffect(() => {
    if (isCalculated && annualAvg !== null && annualAvg >= 10.00) {
      setShowConfetti(true)
      playSuccessSound()
      posthog.capture('confetti_triggered', { annualAvg })
      const timer = setTimeout(() => setShowConfetti(false), 6000)
      return () => clearTimeout(timer)
    } else {
      setShowConfetti(false)
    }
  }, [annualAvg, isCalculated])

  if (!mounted) return null

  const t = TRANSLATIONS[lang]
  const isRtl = lang === 'ar'

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en'
    setLang(nextLang)
    localStorage.setItem('lang', nextLang)
    posthog.capture('language_switched', { language: nextLang })
  }

  const handleS1Change = (val: string) => {
    const num = parseFloat(val)
    if (val === '' || (!isNaN(num) && num >= 0 && num <= 20)) {
      setS1Value(val)
      setIsCalculated(false)
      if (errors.s1) {
        setErrors((prev) => ({ ...prev, s1: false }))
      }
    }
  }

  const handleGradeChange = (index: number, field: 'cc' | 'exam', val: string) => {
    const num = parseFloat(val)
    if (val === '' || (!isNaN(num) && num >= 0 && num <= 20)) {
      const newGrades = [...grades]
      newGrades[index] = { ...newGrades[index], [field]: val }
      setGrades(newGrades)
      setIsCalculated(false)
      if (errors.subjects[index]?.[field]) {
        setErrors((prev) => {
          const updated = [...prev.subjects]
          updated[index] = { ...updated[index], [field]: false }
          return { ...prev, subjects: updated }
        })
      }
    }
  }

  const resetAll = () => {
    setS1Value('')
    setGrades(SUBJECTS.map(() => ({ cc: '', exam: '' })))
    setIsCalculated(false)
    setErrors({ s1: false, subjects: SUBJECTS.map(() => ({ cc: false, exam: false })) })
    localStorage.removeItem('s1Value')
    localStorage.removeItem('grades')
    posthog.capture('reset_clicked')
  }

  const handleCalculate = () => {
    const newErrors = {
      s1: s1Value === '' || isNaN(parseFloat(s1Value)),
      subjects: grades.map((g, i) => ({
        cc: SUBJECTS[i].ccPct > 0 && g.cc === '',
        exam: g.exam === '',
      })),
    }

    const hasS1Error = newErrors.s1
    const hasSubjectErrors = newErrors.subjects.some((s) => s.cc || s.exam)

    if (hasS1Error || hasSubjectErrors) {
      setErrors(newErrors)
      setIsCalculated(false)
      const missing: string[] = []
      if (hasS1Error) missing.push('S1')
      newErrors.subjects.forEach((s, i) => {
        const name = lang === 'ar' ? SUBJECTS[i].nameAr : SUBJECTS[i].nameEn
        if (s.cc) missing.push(`${name} (CC)`)
        if (s.exam) missing.push(`${name} (${t.examLabel})`)
      })
      toast.error(`${lang === 'ar' ? 'الحقول الفارغة:' : 'Missing:'}\n${missing.join('\n')}`, {
        duration: 5000,
        style: { whiteSpace: 'pre-line', direction: isRtl ? 'rtl' : 'ltr' },
      })
      return
    }

    setErrors({ s1: false, subjects: SUBJECTS.map(() => ({ cc: false, exam: false })) })
    setIsCalculated(true)
    posthog.capture('calculate_clicked', { passed: annualAvg !== null && annualAvg >= 10, filledCount })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getInputClass = (val: string, hasError?: boolean) => {
    if (hasError) return 'border-red-500 ring-2 ring-red-500/40 focus-visible:ring-red-500/50'
    if (val === '') return ''
    const num = parseFloat(val)
    if (isNaN(num)) return ''
    if (num >= 10) return 'border-emerald-500 focus-visible:ring-emerald-500/30'
    if (num >= 8) return 'border-amber-500 focus-visible:ring-amber-500/30'
    return 'border-rose-500 focus-visible:ring-rose-500/30'
  }

  const getMoyColorClass = (moy: number | null) => {
    if (moy === null) return 'text-muted-foreground'
    if (moy >= 10) return 'text-emerald-500 font-bold'
    if (moy >= 8) return 'text-amber-500 font-bold'
    return 'text-rose-500 font-bold'
  }

  const getBadgeVariant = (moy: number | null): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (moy === null) return 'secondary'
    if (moy >= 10) return 'default'
    if (moy >= 8) return 'secondary'
    return 'destructive'
  }

  const getBadgeColorClass = (moy: number | null) => {
    if (moy === null) return 'bg-muted text-muted-foreground border-transparent'
    if (moy >= 10) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
    if (moy >= 8) return 'bg-amber-500/10 text-amber-500 border-amber-500/25'
    return 'bg-rose-500/10 text-rose-500 border-rose-500/25'
  }

  const sortedRanking = SUBJECTS.map((sub, index) => ({
    name: lang === 'ar' ? sub.nameAr : sub.nameEn,
    moy: subjectMoys[index],
  }))
    .filter((item) => item.moy !== null)
    .sort((a, b) => (b.moy as number) - (a.moy as number))

  const s1Num = s1Value !== '' && !isNaN(parseFloat(s1Value)) ? parseFloat(s1Value) : null

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-16 relative overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {showConfetti && <ConfettiEffect count={isMobile ? 25 : 50} />}
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.06] dark:opacity-[0.03] pointer-events-none z-0 print:hidden" />

      {/* Premium Glassmorphic Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
        {/* Top left deep violet glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] dark:bg-violet-500/10 opacity-70" />
        
        {/* Top right intense indigo glow */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-500/12 opacity-80" />
        
        {/* Center-left soft rose glow */}
        <div className="absolute top-[35%] -left-60 w-[700px] h-[700px] rounded-full bg-rose-500/5 blur-[150px] dark:bg-rose-500/5 opacity-60" />
        
        {/* Center-right emerald/teal glow */}
        <div className="absolute top-[50%] -right-40 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[140px] dark:bg-teal-500/8 opacity-75 animate-pulse duration-5000" />
        
        {/* Bottom center deep blue-purple pool */}
        <div className="absolute -bottom-60 left-[20%] w-[800px] h-[500px] rounded-full bg-purple-500/5 blur-[160px] dark:bg-purple-900/10 opacity-70" />
      </div>

      <div className="container relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Global Top Banner Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b pb-6 mb-8 w-full print:hidden">
          {/* Logo with text */}
          <div className="flex items-center gap-3">
            <div className="relative group bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-indigo-500/5 shadow-sm">
              <UnivLogo className="w-12 h-auto" />
            </div>
            <div>
              <h3 className="font-bold text-xs tracking-wider text-foreground leading-tight">Université Tlemcen</h3>
              <p className="text-[10px] text-muted-foreground font-mono">Master 1 RSD</p>
            </div>
          </div>

          {/* THE ABSOLUTE (Big Red & White Text) */}
          <a
            href="https://www.instagram.com/missaoui.exe_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center sm:text-right bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 shadow-lg transition-all duration-300 hover:scale-105 hover:border-red-500/50 block group cursor-pointer"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight select-none">
              <span className="text-red-500 transition-colors duration-300 group-hover:text-red-400">THE</span>{' '}
              <span className="text-white">ABSOLUTE</span>
            </h2>
          </a>
        </div>

        <div className="flex justify-center w-full">
          {/* Center Main Content */}
          <main className="flex-1 w-full max-w-3xl min-w-0">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 mb-8 gap-4 w-full min-w-0">
              <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                <div>
                  <p className="font-mono text-xs tracking-wider text-primary uppercase mb-1">{t.subtitle}</p>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    {t.title} <span className="text-primary font-black">{t.titleHighlight}</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 print:hidden">
                  <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2 font-mono text-xs font-bold">
                    <Languages className="size-4" />
                    <span>{t.langSwitch}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-lg"
                  >
                    {theme === 'dark' ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-indigo-500" />}
                  </Button>
                </div>
              </div>
            </header>

            <div className="grid gap-6 min-w-0 overflow-x-hidden">
              {/* Semester 1 Section */}
              <div className="min-w-0">
                <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3 px-1">{t.s1Section}</h2>
                <Card className="relative overflow-hidden border-l-4 border-l-sky-500 dark:border-l-sky-600">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5 px-6">
                    <div>
                      <span className="font-mono text-[10px] text-sky-500 font-bold uppercase tracking-widest">S1</span>
                      <p className="text-base font-bold">{t.s1Heading}</p>
                    </div>
                    <div className="flex-1 min-w-[160px] max-w-sm">
                      <Input
                        type="number"
                        value={s1Value}
                        onChange={(e) => handleS1Change(e.target.value)}
                        placeholder={t.s1Placeholder}
                        className={`font-mono text-lg font-bold text-center h-11 shadow-inner ${getInputClass(s1Value, errors.s1)}`}
                        min="0"
                        max="20"
                        step="0.01"
                      />
                      {errors.s1 && (
                        <p className="flex items-center gap-1 mt-1 text-[10px] font-mono font-bold text-red-500">
                          <AlertCircle className="size-3" />
                          0 — 20
                        </p>
                      )}
                    </div>
                    <Badge className={`h-9 px-4 font-mono font-bold text-sm border rounded-full ${getBadgeColorClass(s1Value !== '' ? parseFloat(s1Value) : null)}`}>
                      {s1Value !== '' && !isNaN(parseFloat(s1Value)) ? parseFloat(s1Value).toFixed(2) : '—'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

          {/* Annual Average Section */}
          <div className="min-w-0">
            <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3 px-1">{t.annualSection}</h2>
            <Card className={`relative overflow-hidden border-t-2 transition-all duration-300 ${isCalculated && annualAvg !== null ? 'border-t-yellow-500' : 'border-t-transparent'}`}>
              <CardContent className="py-6 px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t.annualLabel}</p>
                    <h3 className={`text-4xl sm:text-5xl font-black tracking-tighter break-all ${getMoyColorClass(isCalculated ? annualAvg : null)}`}>
                      {isCalculated && annualAvg !== null ? annualAvg.toFixed(2) : '❓❓'}
                    </h3>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <Badge className={`h-8 px-4 font-bold text-xs border rounded-full ${getBadgeColorClass(isCalculated ? annualAvg : null)}`}>
                      {!isCalculated
                        ? 'Locked'
                        : annualAvg === null
                        ? t.annualPartial
                        : annualAvg >= 10
                        ? t.annualPassed
                        : annualAvg >= 8
                        ? t.annualResit
                        : t.annualFailed}
                    </Badge>
                    <div className="font-mono text-xs text-muted-foreground space-y-0.5">
                      <p>S1: <span className="font-bold text-foreground">{s1Value !== '' ? parseFloat(s1Value).toFixed(2) : '—'}</span></p>
                      <p>S2: <span className="font-bold text-foreground">{isCalculated && s2Average !== null ? s2Average.toFixed(2) : '—'}</span></p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${isCalculated && annualAvg !== null ? Math.min((annualAvg / 20) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Semester 2 Section */}
          <div className="min-w-0">
            <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3 px-1">{t.s2Section}</h2>
            <Card className="relative overflow-hidden border-t-2 border-t-primary/20">
              <CardContent className="py-6 px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t.s2Avg}</p>
                    <h3 className={`text-4xl sm:text-5xl font-black tracking-tighter break-all ${getMoyColorClass(isCalculated ? s2Average : null)}`}>
                      {isCalculated && s2Average !== null ? s2Average.toFixed(2) : '❓❓'}
                    </h3>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <Badge className={`h-8 px-4 font-bold text-xs border rounded-full ${getBadgeColorClass(isCalculated ? s2Average : null)}`}>
                      {!isCalculated
                        ? 'Locked'
                        : s2Average === null
                        ? t.waiting
                        : filledCount === 8
                        ? s2Average >= 10
                          ? t.passed
                          : s2Average >= 8
                          ? t.resit
                          : t.failed
                        : t.pctComplete(Math.round((filledCount / 8) * 100))}
                    </Badge>
                    <div className="font-mono text-xs text-muted-foreground space-y-0.5">
                      <p>{t.coeffUsed(usedCoeff, 20)}</p>
                      <p>{t.subjectsN(filledCount)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${isCalculated && s2Average !== null ? Math.min((s2Average / 20) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 min-w-0">
            <Card className="text-center py-4 px-2">
              <p className="text-xl font-extrabold text-indigo-500">{filledCount}/8</p>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{t.statFilled}</span>
            </Card>
            <Card className="text-center py-4 px-2">
              <p className="text-xl font-extrabold text-emerald-500">{isCalculated && bestGrade !== null ? bestGrade.toFixed(2) : '❓❓'}</p>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{t.statBest}</span>
            </Card>
            <Card className="text-center py-4 px-2">
              <p className="text-xl font-extrabold text-rose-500">{isCalculated && lowestGrade !== null ? lowestGrade.toFixed(2) : '❓❓'}</p>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{t.statWorst}</span>
            </Card>
          </div>

          {/* Subjects Grid */}
          <div className="min-w-0">
            <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3 px-1">{t.subjectsTitle}</h2>
            <div className="flex flex-col gap-3">
              {SUBJECTS.map((sub, i) => {
                const itemMoy = subjectMoys[i]
                const gradeItem = grades[i] || { cc: '', exam: '' }
                const isFilled = gradeItem.cc !== '' || gradeItem.exam !== ''

                return (
                  <Card
                    key={i}
                    className={`transition-all duration-300 border-l-4 ${
                      errors.subjects[i]?.cc || errors.subjects[i]?.exam
                        ? 'border-l-red-500 bg-red-500/[0.03]'
                        : isFilled
                          ? 'border-l-primary bg-primary/[0.02]'
                          : 'border-l-muted'
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                          {lang === 'ar' ? sub.nameAr : sub.nameEn}
                        </h4>
                        <Badge variant="outline" className="h-6 font-mono text-[10px] gap-1 shrink-0">
                          <span className="text-muted-foreground">{t.coeffLabel}</span>
                          <span className="font-bold text-indigo-500">{sub.coeff}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {sub.ccPct > 0 ? (
                          <div className="space-y-1">
                            <label className="font-mono text-[9px] font-bold text-muted-foreground tracking-wider uppercase">
                              📝 {t.cc(Math.round(sub.ccPct * 100))}
                            </label>
                            <Input
                              type="number"
                              value={gradeItem.cc}
                              onChange={(e) => handleGradeChange(i, 'cc', e.target.value)}
                              placeholder="/ 20"
                              min="0"
                              max="20"
                              step="0.01"
                              className={`font-mono text-center h-10 ${getInputClass(gradeItem.cc, errors.subjects[i]?.cc)}`}
                            />
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className="space-y-1">
                          <label className="font-mono text-[9px] font-bold text-muted-foreground tracking-wider uppercase">
                            🎓 {t.exam(Math.round(sub.examPct * 100))}
                          </label>
                          <Input
                            type="number"
                            value={gradeItem.exam}
                            onChange={(e) => handleGradeChange(i, 'exam', e.target.value)}
                            placeholder="/ 20"
                            min="0"
                            max="20"
                            step="0.01"
                            className={`font-mono text-center h-10 ${getInputClass(gradeItem.exam, errors.subjects[i]?.exam)}`}
                          />
                        </div>
                      </div>

                      {(errors.subjects[i]?.cc || errors.subjects[i]?.exam) && (
                        <div className="flex items-center gap-1 p-2 rounded-lg bg-red-500/5 font-mono text-[10px] text-red-500 font-bold">
                          <AlertCircle className="size-3 shrink-0" />
                          <span>0 — 20</span>
                        </div>
                      )}
                      {isFilled && !errors.subjects[i]?.cc && !errors.subjects[i]?.exam && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 font-mono text-xs">
                          <span className="text-muted-foreground">{t.subjectAvg}</span>
                          <span className={getMoyColorClass(itemMoy)}>
                            {itemMoy !== null ? itemMoy.toFixed(2) : '—'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden min-w-0">
            <Button onClick={resetAll} variant="outline" className="flex-1 h-11 font-bold text-sm gap-2">
              <Trash2 className="size-4" />
              <span>{t.reset}</span>
            </Button>
            <Button onClick={handleCalculate} className="flex-1 h-11 font-bold text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors">
              <Calculator className="size-4" />
              <span>{t.calculate}</span>
            </Button>
          </div>

          {/* Subject Ranking */}
          {isCalculated && sortedRanking.length > 0 && (
            <div className="min-w-0">
              <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-3 px-1">{t.rankingTitle}</h2>
              <Card className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {sortedRanking.map((item, rankIndex) => (
                    <div key={rankIndex} className="flex items-center gap-3 border-b last:border-0 pb-2 last:pb-0">
                      <span className="font-mono text-xs text-muted-foreground w-6 text-center">{rankIndex + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <p className="text-xs sm:text-sm font-semibold truncate text-muted-foreground">{item.name}</p>
                          <span className={`font-mono text-xs font-bold ${getMoyColorClass(item.moy)}`}>
                            {item.moy !== null ? item.moy.toFixed(2) : '—'}
                          </span>
                        </div>
                        <Progress
                          value={item.moy !== null ? (item.moy / 20) * 100 : 0}
                          className="h-1 bg-muted"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formulas */}
          <Card className="bg-muted/30 border-dashed border print:hidden min-w-0">
            <CardContent className="p-4 sm:p-5 font-mono text-xs leading-relaxed space-y-2">
              <p className="text-muted-foreground uppercase font-bold text-[10px] tracking-wider mb-2">{t.formulaTitle}</p>
              <p className="text-indigo-500">{t.formula1}</p>
              <p className="text-indigo-500">{t.formula2}</p>
              <p className="text-yellow-500">{t.formula3}</p>
              <div className="pt-2 border-t border-muted text-muted-foreground text-[11px] flex items-center justify-between">
                <span>{t.threshold}</span>
                <span className="text-primary font-bold">10.00 / 20</span>
              </div>
            </CardContent>
          </Card>
        </div>
          </main>
        </div>
      </div>
    </div>
  )
}