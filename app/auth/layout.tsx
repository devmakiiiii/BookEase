"use client"

import type React from "react"
import { usePathname } from "next/navigation"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSignup = pathname === "/auth/signup"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
