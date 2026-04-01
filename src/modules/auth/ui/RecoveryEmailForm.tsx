'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { RecoveryFlow } from '@ory/client'
import { recoveryEmailSchema, type RecoveryEmailValues } from '../model/schemas'
import { extractKratosError, initRecoveryFlow, submitRecoveryEmail } from '../api'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

export function RecoveryEmailForm() {
  const router = useRouter()
  const [flow, setFlow] = useState<RecoveryFlow | null>(null)
  const [serverError, setServerError] = useState('')
  const [isBooting, setIsBooting] = useState(true)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryEmailValues>({ resolver: zodResolver(recoveryEmailSchema) })

  useEffect(() => {
    let active = true

    initRecoveryFlow()
      .then((nextFlow) => {
        if (!active) return
        setFlow(nextFlow)
      })
      .catch(() => {
        if (!active) return
        setServerError('Не удалось инициализировать форму. Обновите страницу и попробуйте снова.')
      })
      .finally(() => {
        if (!active) return
        setIsBooting(false)
      })

    return () => {
      active = false
    }
  }, [])

  const onSubmit = (values: RecoveryEmailValues) => {
    setServerError('')

    startTransition(async () => {
      try {
        const activeFlow = flow?.id ? flow : await initRecoveryFlow()
        setFlow(activeFlow)

        await submitRecoveryEmail(activeFlow, values.email)
        router.push('/recovery/check-email')
      } catch (err) {
        setServerError(extractKratosError(err))
      }
    })
  }

  return (
    <>
      <Link href="/sign-in" className="flex items-center gap-1 text-sm text-gray-700 mb-6 hover:opacity-70">
        <span>&#8592;</span>
        <span className="font-medium">Восстановление пароля</span>
      </Link>

      <p className="text-xs text-gray-500 mb-6">
        Укажите адрес почты на который был зарегистрирован аккаунт
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5" aria-busy={isPending || isBooting}>
        <Input
          label="E-mail"
          type="email"
          placeholder="Введите e-mail"
          autoComplete="email"
          disabled={isPending || isBooting}
          error={errors.email?.message ?? serverError}
          {...register('email')}
        />

        {isBooting && !serverError && (
          <p className="text-xs text-gray-500" aria-live="polite">
            Подготавливаем recovery-flow...
          </p>
        )}

        <Button type="submit" loading={isPending} disabled={!flow || isBooting}>
          Восстановить пароль
        </Button>
      </form>
    </>
  )
}
