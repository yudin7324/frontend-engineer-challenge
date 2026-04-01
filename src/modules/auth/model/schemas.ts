import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email('Введите корректный e-mail'),
  password: z.string().min(1, 'Введите пароль'),
})

export const signUpSchema = z
  .object({
    email: z.email('Введите корректный e-mail'),
    password: z.string().min(8, 'Минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export const recoveryEmailSchema = z.object({
  email: z.email('Введите корректный e-mail'),
})

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type RecoveryEmailValues = z.infer<typeof recoveryEmailSchema>
export type NewPasswordValues = z.infer<typeof newPasswordSchema>
