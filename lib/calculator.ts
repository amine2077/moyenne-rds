import { SUBJECTS, TOTAL_COEFF } from './data'

export type GradeClass = 'pass' | 'warn' | 'fail' | 'empty'

export function gradeClass(v: number | null): GradeClass {
  if (v === null) return 'empty'
  if (v >= 10) return 'pass'
  if (v >= 8) return 'warn'
  return 'fail'
}

export function getSubjectMoy(
  ccVal: string,
  examVal: string,
  ccPct: number,
  examPct: number
): number | null {
  const exam = parseFloat(examVal)
  const cc = parseFloat(ccVal)
  if (ccPct === 0) return isNaN(exam) ? null : exam
  if (!isNaN(exam) && !isNaN(cc)) return cc * ccPct + exam * examPct
  if (!isNaN(exam)) return exam * examPct
  return null
}

export interface SubjectGrade {
  cc: string
  exam: string
}

export interface CalcResult {
  s2Average: number | null
  filled: number
  best: number | null
  worst: number | null
  usedCoeff: number
  totalCoeff: number
  subjectMoys: (number | null)[]
}

export function calculateS2(grades: SubjectGrade[]): CalcResult {
  let weightedSum = 0
  let usedCoeff = 0
  let filled = 0
  let best: number | null = null
  let worst: number | null = null
  const subjectMoys: (number | null)[] = []

  SUBJECTS.forEach((sub, i) => {
    const ccVal = grades[i]?.cc || ''
    const examVal = grades[i]?.exam || ''
    const moy = getSubjectMoy(ccVal, examVal, sub.ccPct, sub.examPct)
    subjectMoys.push(moy)
    if (moy !== null) {
      weightedSum += moy * sub.coeff
      usedCoeff += sub.coeff
      filled++
      if (best === null || moy > best) best = moy
      if (worst === null || moy < worst) worst = moy
    }
  })

  return {
    s2Average: filled > 0 ? weightedSum / usedCoeff : null,
    filled,
    best,
    worst,
    usedCoeff,
    totalCoeff: TOTAL_COEFF,
    subjectMoys,
  }
}

export function calculateAnnual(s1: number | null, s2: number | null): number | null {
  if (s1 === null || s2 === null) return null
  return (s1 + s2) / 2
}

export function parseGrade(val: string): number | null {
  const n = parseFloat(val)
  if (isNaN(n) || n < 0 || n > 20) return null
  return n
}
