import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NewPasswordForm } from '@/modules/auth/ui/NewPasswordForm'

export const metadata: Metadata = { title: 'Задайте пароль — Orbitto' }

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordForm />
    </Suspense>
  )
}
