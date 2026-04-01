import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/recovery']
const AUTH_PAGES = ['/sign-in', '/sign-up', '/recovery']
// proxy.ts runs server-side, so use internal URL (no CORS)
const KRATOS_URL = process.env.KRATOS_INTERNAL_URL ?? process.env.NEXT_PUBLIC_KRATOS_URL ?? 'http://localhost:4433'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  try {
    const res = await fetch(`${KRATOS_URL}/sessions/whoami`, {
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
    })

    if (!res.ok) {
      if (isPublic) return NextResponse.next()
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const isAuthPage = AUTH_PAGES.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )

    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
