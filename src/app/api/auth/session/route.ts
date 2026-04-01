import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const KRATOS_URL = process.env.KRATOS_INTERNAL_URL ?? 'http://localhost:4433'

export async function POST() {
  return NextResponse.json({ error: 'Session token persistence is not used for browser flows.' }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')

  if (!cookieHeader) {
    return NextResponse.json({ ok: true })
  }

  const flowResponse = await fetch(`${KRATOS_URL}/self-service/logout/browser`, {
    headers: {
      Accept: 'application/json',
      Cookie: cookieHeader,
    },
  })

  if (!flowResponse.ok) {
    return NextResponse.json({ error: 'Failed to initialize logout' }, { status: flowResponse.status })
  }

  const flow = (await flowResponse.json()) as { logout_token?: string }

  const logoutResponse = await fetch(
    `${KRATOS_URL}/self-service/logout${flow.logout_token ? `?token=${encodeURIComponent(flow.logout_token)}` : ''}`,
    {
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
      redirect: 'manual',
    }
  )

  const response = NextResponse.json({ ok: logoutResponse.ok })
  logoutResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      response.headers.append('Set-Cookie', value)
    }
  })

    return response
}
