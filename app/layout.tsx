import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Solana Validator Analytics Dashboard",
  description: "Monitor and analyze Solana validator performance with ML-powered predictions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransition>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 border-b bg-background">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-8">
                  <MainNav />
                  <MobileNav />
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/yourusername/solana-validator-dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium underline underline-offset-4"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
