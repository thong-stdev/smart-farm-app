import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function daysBetween(date1: Date | undefined | null, date2: Date | undefined | null): number {
  if (!date1 || !date2) return 0
  const oneDay = 24 * 60 * 60 * 1000
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
  return diffDays
}

export function formatDate(date: Date | string): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount)
}
