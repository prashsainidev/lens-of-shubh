import withAuth, { type NextRequestWithAuth } from 'next-auth/middleware'
import type { NextFetchEvent } from 'next/server'
import { NextResponse } from 'next/server'

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

        // Protect dashboard routes (must be logged in)
        if (isDashboardPage) {
          return !!token;
        }

        // Other matched routes (like /login) are authorized to access the page (redirection handled in middleware)
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export function proxy(req: NextRequestWithAuth, event: NextFetchEvent) {
  return authMiddleware(req, event)
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login"
  ],
}
