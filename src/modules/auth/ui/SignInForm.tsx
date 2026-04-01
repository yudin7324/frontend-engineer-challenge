'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LoginFlow } from '@ory/client'
import { signInSchema, type SignInValues } from '../model/schemas'
import { extractKratosError, initLoginFlow, submitLogin } from '../api'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

export function SignInForm() {
  const router = useRouter()
  const [flow, setFlow] = useState<LoginFlow | null>(null)
  const [serverError, setServerError] = useState('')
  const [isBooting, setIsBooting] = useState(true)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) })

  useEffect(() => {
    let active = true

    initLoginFlow()
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

  const onSubmit = (values: SignInValues) => {
    setServerError('')

    startTransition(async () => {
      try {
        const activeFlow = flow?.id ? flow : await initLoginFlow()
        setFlow(activeFlow)

        await submitLogin(activeFlow, values.email, values.password)
        router.replace('/dashboard')
        router.refresh()
      } catch (err) {
        setServerError(extractKratosError(err))
      }
    })
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Войти в систему</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5" aria-busy={isPending || isBooting}>
        <Input
          label="E-mail"
          type="email"
          placeholder="Введите e-mail"
          autoComplete="email"
          disabled={isPending || isBooting}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Пароль"
          type="password"
          placeholder="Введите пароль"
          autoComplete="current-password"
          disabled={isPending || isBooting}
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && <p className="text-xs text-red-500" role="alert">{serverError}</p>}

        {isBooting && !serverError && (
          <p className="text-xs text-gray-500" aria-live="polite">
            Подготавливаем auth-flow...
          </p>
        )}

        <Button type="submit" loading={isPending} disabled={!flow || isBooting} className="mt-1">
          Войти
        </Button>

        <div className="text-center">
          <Link href="/recovery" className="text-xs text-[#4B96E8] hover:underline">
            Забыли пароль?
          </Link>
        </div>
      </form>

      <p className="mt-10 text-center text-xs text-gray-500">
        Еще не зарегистрированы?{' '}
        <Link href="/sign-up" className="text-[#4B96E8] hover:underline">
          Регистрация
        </Link>
      </p>
    </div>
  )
}
