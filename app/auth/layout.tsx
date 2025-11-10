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
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-muted bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat flex items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
