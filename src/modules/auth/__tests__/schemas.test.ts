import { extractKratosError } from '../api'
import { signInSchema, signUpSchema, recoveryEmailSchema, newPasswordSchema } from '../model/schemas'

describe('signInSchema', () => {
  it('passes with valid email and password', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = signInSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('fails with empty password', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('signUpSchema', () => {
  it('passes when passwords match and are long enough', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'strongpass1',
      confirmPassword: 'strongpass1',
    })
    expect(result.success).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'strongpass1',
      confirmPassword: 'differentpass',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0])
      expect(paths).toContain('confirmPassword')
    }
  })

  it('fails when password is shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})

describe('recoveryEmailSchema', () => {
  it('passes with valid email', () => {
    expect(recoveryEmailSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('fails with invalid email', () => {
    expect(recoveryEmailSchema.safeParse({ email: 'bad' }).success).toBe(false)
  })
})

describe('newPasswordSchema', () => {
  it('passes when passwords match', () => {
    expect(
      newPasswordSchema.safeParse({ password: 'newpassword1', confirmPassword: 'newpassword1' }).success
    ).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = newPasswordSchema.safeParse({ password: 'pass1234', confirmPassword: 'other123' })
    expect(result.success).toBe(false)
  })
})

describe('extractKratosError', () => {
  it('reads a backend message from a non-axios response-shaped error', () => {
    expect(
      extractKratosError({
        response: {
          data: {
            error: {
              message: 'Пароль слишком короткий.',
            },
          },
        },
      })
    ).toBe('Пароль слишком короткий.')
  })
})
