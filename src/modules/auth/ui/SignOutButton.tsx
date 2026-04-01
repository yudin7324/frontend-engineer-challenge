'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/shared/ui/Button'

export function SignOutButton() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const onSignOut = () => {
    setError('')

    startTransition(async () => {
      const response = await fetch('/api/auth/session', { method: 'DELETE' })

      if (!response.ok) {
        setError('Не удалось завершить сессию. Попробуйте ещё раз.')
        return
      }

      router.replace('/sign-in')
      router.refresh()
    })
  }

  return (
    <div className="w-full max-w-[220px]">
      <Button type="button" variant="ghost" loading={isPending} onClick={onSignOut} className="justify-center border border-slate-200 bg-white/70 px-4 py-3 shadow-none hover:bg-white">
        Выйти
      </Button>
      {error && (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
