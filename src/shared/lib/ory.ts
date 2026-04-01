import { Configuration, FrontendApi } from '@ory/client'

// Browser requests go through our same-origin proxy so Kratos cookies/CSRF state stay bound
// to the frontend origin and are not affected by cross-origin browser behavior.
const basePath =
  typeof window !== 'undefined'
    ? '/api/kratos'
    : (process.env.KRATOS_INTERNAL_URL ?? 'http://localhost:4433')

export const ory = new FrontendApi(
  new Configuration({
    basePath,
    baseOptions: { withCredentials: true },
  })
)
