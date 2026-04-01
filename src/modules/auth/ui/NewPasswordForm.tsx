'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { ory } from '@/shared/lib/ory'
import { newPasswordSchema, type NewPasswordValues } from '../model/schemas'
import { extractKratosError } from '../api'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

export function NewPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const flowId = searchParams.get('flow') ?? ''
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema) })

  const onSubmit = (values: NewPasswordValues) => {
    if (!flowId) {
      setServerError('Ссылка недействительна. Запросите восстановление пароля заново.')
      return
    }
    setServerError('')

    startTransition(async () => {
      try {
        await ory.updateSettingsFlow({
          flow: flowId,
          updateSettingsFlowBody: {
            method: 'password',
            password: values.password,
          },
        })
        router.replace('/recovery/success')
      } catch (err) {
        const msg = extractKratosError(err)
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          router.replace('/recovery/error')
        } else {
          setServerError(msg)
        }
      }
    })
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Задайте пароль</h1>
      <p className="text-xs text-gray-500 mb-6">
        Придумайте новый пароль, который будет использоваться для входа
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Input
          label="Пароль"
          type="password"
          placeholder="Задайте пароль"
          autoComplete="new-password"
          disabled={isPending}
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Повторите пароль"
          type="password"
          placeholder="Повторите пароль"
          autoComplete="new-password"
          disabled={isPending}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && <p className="text-xs text-red-500" role="alert">{serverError}</p>}

        <Button type="submit" loading={isPending}>
          Изменить пароль
        </Button>
      </form>
    </>
  )
}
