import type { Metadata } from 'next'
import { SignUpForm } from '@/modules/auth/ui/SignUpForm'

export const metadata: Metadata = { title: 'Регистрация — Orbitto' }

export default function SignUpPage() {
  return <SignUpForm />
}
