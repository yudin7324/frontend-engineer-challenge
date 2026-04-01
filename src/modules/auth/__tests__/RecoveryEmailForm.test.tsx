import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecoveryEmailForm } from '../ui/RecoveryEmailForm'

jest.mock('../api', () => ({
  initRecoveryFlow: jest.fn(() => Promise.resolve({ id: 'flow-id', ui: { nodes: [] } })),
  submitRecoveryEmail: jest.fn(),
  extractKratosError: jest.fn(() => 'Нет аккаунта с таким e-mail'),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('RecoveryEmailForm', () => {
  it('renders email field and submit button', async () => {
    render(<RecoveryEmailForm />)
    expect(await screen.findByPlaceholderText('Введите e-mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /восстановить пароль/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    render(<RecoveryEmailForm />)
    const submitButton = await screen.findByRole('button', { name: /восстановить пароль/i })
    await waitFor(() => expect(submitButton).toBeEnabled())
    await userEvent.type(screen.getByPlaceholderText('Введите e-mail'), 'bad-email')
    await userEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/введите корректный e-mail/i)).toBeInTheDocument()
    })
  })

  it('shows server error when account not found', async () => {
    const { submitRecoveryEmail } = await import('../api')
    ;(submitRecoveryEmail as jest.Mock).mockRejectedValueOnce(new Error('404'))

    render(<RecoveryEmailForm />)
    const submitButton = await screen.findByRole('button', { name: /восстановить пароль/i })
    await waitFor(() => expect(submitButton).toBeEnabled())

    await userEvent.type(screen.getByPlaceholderText('Введите e-mail'), 'notfound@example.com')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Нет аккаунта с таким e-mail')).toBeInTheDocument()
    })
  })
})
