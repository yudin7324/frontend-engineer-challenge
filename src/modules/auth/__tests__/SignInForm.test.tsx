import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInForm } from '../ui/SignInForm'

// Mock Ory API
jest.mock('../api', () => ({
  initLoginFlow: jest.fn(() => Promise.resolve({ id: 'flow-id', ui: { nodes: [] } })),
  submitLogin: jest.fn(),
  extractKratosError: jest.fn(() => 'Введены неверные данные'),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
}))

describe('SignInForm', () => {
  it('renders email and password fields', async () => {
    render(<SignInForm />)
    expect(await screen.findByPlaceholderText('Введите e-mail')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    render(<SignInForm />)
    const submitButton = await screen.findByRole('button', { name: /войти/i })
    await waitFor(() => expect(submitButton).toBeEnabled())
    await userEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/введите корректный e-mail/i)).toBeInTheDocument()
    })
  })

  it('shows server error on failed login', async () => {
    const { submitLogin } = await import('../api')
    ;(submitLogin as jest.Mock).mockRejectedValueOnce(new Error('401'))

    render(<SignInForm />)

    const submitButton = await screen.findByRole('button', { name: /войти/i })
    await waitFor(() => expect(submitButton).toBeEnabled())

    await userEvent.type(screen.getByPlaceholderText('Введите e-mail'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), 'wrongpassword')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Введены неверные данные')).toBeInTheDocument()
    })
  })

  it('has a link to registration', async () => {
    render(<SignInForm />)
    const link = screen.getByRole('link', { name: /регистрация/i })
    expect(link).toHaveAttribute('href', '/sign-up')
  })

  it('has a link to password recovery', () => {
    render(<SignInForm />)
    const link = screen.getByRole('link', { name: /забыли пароль/i })
    expect(link).toHaveAttribute('href', '/recovery')
  })
})
