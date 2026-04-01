import { cookies } from 'next/headers'

const KRATOS_URL =
  process.env.KRATOS_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_KRATOS_URL ??
  'http://localhost:4433'

export interface SessionIdentity {
  id: string
  email: string | null
  active: boolean
  expiresAt: string | null
}

export async function getCurrentSession(): Promise<SessionIdentity | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  if (!cookieHeader) {
    return null
  }

  try {
    const response = await fetch(`${KRATOS_URL}/sessions/whoami`, {
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const session = await response.json()
    const traits = session.identity?.traits as { email?: string } | undefined

    return {
      id: session.identity?.id ?? 'unknown',
      email: traits?.email ?? null,
      active: Boolean(session.active),
      expiresAt: session.expires_at ?? null,
    }
  } catch {
    return null
  }
}
