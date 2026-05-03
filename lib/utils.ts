import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateLevel(xp: number): number {
  // Level formula: level = sqrt(xp / 100)
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function calculateXpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export function calculateStreak(lastActivity: string, currentStreak: number): number {
  const lastDate = new Date(lastActivity)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return currentStreak + 1
  } else if (diffDays > 1) {
    return 0
  }
  return currentStreak
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function playSound(type: 'success' | 'error' | 'click' | 'achievement' | 'levelUp'): void {
  // Will be implemented with actual sound files
  const sounds = {
    success: '/sounds/success.mp3',
    error: '/sounds/error.mp3',
    click: '/sounds/click.mp3',
    achievement: '/sounds/achievement.mp3',
    levelUp: '/sounds/levelup.mp3',
  }
  
  // Placeholder for sound implementation
  console.log(`Playing sound: ${type}`)
}
