export const RANKS = [
  { name: 'Recruit',  minXp: 0,    color: 'text-slate-500',  bg: 'bg-slate-100',  bar: 'bg-slate-400'  },
  { name: 'Novice',   minXp: 100,  color: 'text-green-600',  bg: 'bg-green-50',   bar: 'bg-green-500'  },
  { name: 'Builder',  minXp: 350,  color: 'text-blue-600',   bg: 'bg-blue-50',    bar: 'bg-blue-500'   },
  { name: 'Engineer', minXp: 800,  color: 'text-purple-600', bg: 'bg-purple-50',  bar: 'bg-purple-500' },
  { name: 'Expert',   minXp: 1500, color: 'text-amber-600',  bg: 'bg-amber-50',   bar: 'bg-amber-500'  },
  { name: 'Master',   minXp: 3000, color: 'text-red-600',    bg: 'bg-red-50',     bar: 'bg-red-500'    },
] as const

export type Rank = typeof RANKS[number]

export function getRank(xp: number): Rank {
  let rank: Rank = RANKS[0]
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r
  }
  return rank
}

export function getNextRank(xp: number): Rank | null {
  for (const r of RANKS) {
    if (xp < r.minXp) return r
  }
  return null
}

export function getProgressPercent(xp: number): number {
  const current = getRank(xp)
  const next = getNextRank(xp)
  if (!next) return 100
  const range = next.minXp - current.minXp
  const earned = xp - current.minXp
  return Math.round((earned / range) * 100)
}
