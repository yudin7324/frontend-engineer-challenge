import type { Metadata } from 'next'
import { SignInForm } from '@/modules/auth/ui/SignInForm'

export const metadata: Metadata = { title: 'Войти — Orbitto' }

export default function SignInPage() {
  return <SignInForm />
}
