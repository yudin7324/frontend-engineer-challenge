import { submitRegistration } from '../api'
import { ory } from '@/shared/lib/ory'

jest.mock('@/shared/lib/ory', () => ({
  ory: {
    updateRegistrationFlow: jest.fn(),
  },
}))

describe('submitRegistration', () => {
  it('continues registration when the profile step returns a flow in a 400 response', async () => {
    const updateRegistrationFlow = jest.mocked(ory.updateRegistrationFlow)

    updateRegistrationFlow.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          id: 'flow-id',
          ui: {
            nodes: [
              {
                attributes: {
                  name: 'csrf_token',
                  value: 'second-csrf',
                },
              },
              {
                attributes: {
                  name: 'method',
                  type: 'submit',
                  value: 'password',
                },
              },
            ],
          },
        },
      },
    })

    updateRegistrationFlow.mockResolvedValueOnce({
      data: {},
    } as never)

    await submitRegistration(
      {
        id: 'flow-id',
        ui: {
          nodes: [
            {
              attributes: {
                name: 'csrf_token',
                value: 'first-csrf',
              },
            },
            {
              attributes: {
                name: 'method',
                type: 'submit',
                value: 'profile',
              },
            },
          ],
        },
      } as never,
      'user@example.com',
      'strongpass1'
    )

    expect(updateRegistrationFlow).toHaveBeenNthCalledWith(1, {
      flow: 'flow-id',
      updateRegistrationFlowBody: {
        method: 'profile',
        csrf_token: 'first-csrf',
        traits: { email: 'user@example.com' },
      },
    })

    expect(updateRegistrationFlow).toHaveBeenNthCalledWith(2, {
      flow: 'flow-id',
      updateRegistrationFlowBody: {
        method: 'password',
        csrf_token: 'second-csrf',
        password: 'strongpass1',
        traits: { email: 'user@example.com' },
      },
    })
  })
})
