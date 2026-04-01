import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '../ui/SignUpForm'

const replaceMock = jest.fn()
const refreshMock = jest.fn()

jest.mock('../api', () => ({
  initRegistrationFlow: jest.fn(() => Promise.resolve({ id: 'flow-id', ui: { nodes: [] } })),
  submitRegistration: jest.fn(),
  extractKratosError: jest.fn(() => 'Аккаунт с таким email уже существует.'),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    replaceMock.mockReset()
    refreshMock.mockReset()
  })

  it('shows validation error when passwords differ', async () => {
    render(<SignUpForm />)
    const submitButton = await screen.findByRole('button', { name: /зарегистрироваться/i })
    await waitFor(() => expect(submitButton).toBeEnabled())

    await userEvent.type(screen.getByPlaceholderText('Введите e-mail'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), 'strongpass1')
    await userEvent.type(screen.getByPlaceholderText('Повторите пароль'), 'strongpass2')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument()
    })
  })

  it('redirects to dashboard after successful registration', async () => {
    const { submitRegistration } = await import('../api')
    ;(submitRegistration as jest.Mock).mockResolvedValueOnce(undefined)

    render(<SignUpForm />)
    const submitButton = await screen.findByRole('button', { name: /зарегистрироваться/i })
    await waitFor(() => expect(submitButton).toBeEnabled())

    await userEvent.type(screen.getByPlaceholderText('Введите e-mail'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), 'strongpass1')
    await userEvent.type(screen.getByPlaceholderText('Повторите пароль'), 'strongpass1')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/dashboard')
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  it('shows server error when registration fails', async () => {
    const { submitRegistration } = await import('../api')
    ;(submitRegistration as jest.Mock).mockRejectedValueOnce(new Error('409'))

    render(<SignUpForm />)
    const submitButton = await screen.findByRole('button', { name: /зарегистрироваться/i })
    await waitFor(() => expect(submitButton).toBeEnabled())

    await userEvent.type(screen.getByPlaceholderText('Введите e-mail'), 'user@example.com')
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), 'strongpass1')
    await userEvent.type(screen.getByPlaceholderText('Повторите пароль'), 'strongpass1')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Аккаунт с таким email уже существует.')).toBeInTheDocument()
    })
  })
})
