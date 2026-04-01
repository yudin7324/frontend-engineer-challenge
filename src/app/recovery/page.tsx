import type { Metadata } from 'next'
import { RecoveryEmailForm } from '@/modules/auth/ui/RecoveryEmailForm'

export const metadata: Metadata = { title: 'Восстановление пароля — Orbitto' }

export default function RecoveryPage() {
  return <RecoveryEmailForm />
}
