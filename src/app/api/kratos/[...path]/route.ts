import { type NextRequest, NextResponse } from 'next/server'

const KRATOS_URL = process.env.KRATOS_INTERNAL_URL ?? 'http://localhost:4433'

async function proxyToKratos(request: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params
  const kratosPath = path.join('/')
  const search = request.nextUrl.search
  const url = `${KRATOS_URL}/${kratosPath}${search}`

  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')

  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('Cookie', cookie)

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.text()
    : undefined

  const upstream = await fetch(url, {
    method: request.method,
    headers,
    body,
  })

  const responseBody = await upstream.text()
  const response = new NextResponse(responseBody, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  })

  // Forward Set-Cookie from Kratos to the browser
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      response.headers.append('Set-Cookie', value)
    }
  })

  return response
}

export const GET = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  proxyToKratos(req, ctx.params)

export const POST = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  proxyToKratos(req, ctx.params)

export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  proxyToKratos(req, ctx.params)
