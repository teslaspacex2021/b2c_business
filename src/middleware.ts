import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin)
  const { pathname } = request.nextUrl
  
  // Create response and add pathname header
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  
  // Handle admin-login page first to avoid conflicts
  if (pathname === "/admin-login") {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    
    // If trying to access login page while authenticated, redirect to admin
    if (token) {
      const adminUrl = new URL("/admin", request.url)
      return NextResponse.redirect(adminUrl)
    }
    // Allow access to login page for unauthenticated users
    return response
  }
  
  // Check if it's an admin route (but not admin-login)
  if (pathname.startsWith("/admin")) {
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    
    // If trying to access admin routes without authentication, redirect to login
    if (!token) {
      const loginUrl = new URL("/admin-login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
