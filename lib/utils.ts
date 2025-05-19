import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number | null | undefined, options: Intl.NumberFormatOptions = {}): string {
  if (value === null || value === undefined) return "N/A"
  return new Intl.NumberFormat("en-US", options).format(value)
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatSOL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A"
  return `${formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} SOL`
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ""
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDatetime(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A"
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export function formatTimeAgo(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A"

  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
