"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth"

const SESSION_COOKIE_NAME = "bookease-session"

export async function signup(email: string, password: string, firstName: string, lastName: string) {
  try {
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "User already exists" }
    }

    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "CUSTOMER",
      },
    })

    // Do not set session cookie during signup to allow redirect to login
    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "An error occurred during signup" }
  }
}

export async function login(email: string, password: string) {
  try {
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return { error: "Invalid email or password" }
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return { error: "Invalid email or password" }
    }

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    return { success: true, userId: user.id, role: user.role }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect("/")
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  try {
    const user = await db.user.findUnique({
      where: { id: sessionId },
      include: { admin: true },
    })
    return user
  } catch {
    return null
  }
}
