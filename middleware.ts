import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "bookease-session"

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isProtectedPage =
    request.nextUrl.pathname.startsWith("/book") || request.nextUrl.pathname.startsWith("/dashboard")

  if (isProtectedPage && !sessionId) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (isAuthPage && sessionId) {
    return NextResponse.redirect(new URL("/book", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/auth/:path*", "/book/:path*", "/dashboard/:path*"],
}
