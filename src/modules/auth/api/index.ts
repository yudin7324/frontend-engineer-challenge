import { ory } from '@/shared/lib/ory'
import type { LoginFlow, RegistrationFlow, RecoveryFlow } from '@ory/client'
import { isAxiosError } from 'axios'

type FlowWithNodes = {
  id?: string
  ui: {
    nodes: Array<{
      attributes?: unknown
    }>
  }
}

function ensureFlowId<T extends { id?: string }>(flow: T, flowName: string): T & { id: string } {
  if (!flow.id) {
    throw new Error(`${flowName} did not return a valid flow id`)
  }

  return flow as T & { id: string }
}

function getNodeValue(flow: FlowWithNodes, name: string): string | undefined {
  for (const item of flow.ui.nodes) {
    if (!isRecord(item.attributes)) continue
    if (item.attributes.name !== name) continue
    return typeof item.attributes.value === 'string' ? item.attributes.value : undefined
  }

  return undefined
}

function hasSubmitMethod(flow: FlowWithNodes, method: string): boolean {
  return flow.ui.nodes.some(
    (item) =>
      isRecord(item.attributes) &&
      item.attributes.name === 'method' &&
      item.attributes.type === 'submit' &&
      item.attributes.value === method
  )
}

function getRequiredCsrfToken(flow: FlowWithNodes): string {
  const csrfToken = getNodeValue(flow, 'csrf_token')

  if (!csrfToken) {
    throw new Error('Flow did not return csrf_token')
  }

  return csrfToken
}

function getFlowFromError<T extends FlowWithNodes>(err: unknown): T | undefined {
  if (!isAxiosError(err)) {
    return undefined
  }

  const data = err.response?.data
  if (!isRecord(data)) {
    return undefined
  }

  const ui = getNestedRecord(data, 'ui')
  if (!ui || !Array.isArray(ui.nodes)) {
    return undefined
  }

  return data as T
}

// Native flows don't need CSRF tokens — they're for API/SPA usage
export async function initLoginFlow(): Promise<LoginFlow> {
  const { data } = await ory.createBrowserLoginFlow()
  return ensureFlowId(data, 'Login flow')
}

export async function submitLogin(
  flow: LoginFlow,
  email: string,
  password: string
): Promise<void> {
  const csrfToken = getRequiredCsrfToken(flow)

  await ory.updateLoginFlow({
    flow: flow.id,
    updateLoginFlowBody: { method: 'password', csrf_token: csrfToken, identifier: email, password },
  })
}

export async function initRegistrationFlow(): Promise<RegistrationFlow> {
  const { data } = await ory.createBrowserRegistrationFlow()
  return ensureFlowId(data, 'Registration flow')
}

export async function submitRegistration(
  flow: RegistrationFlow,
  email: string,
  password: string
): Promise<void> {
  let activeFlow: FlowWithNodes & { id: string } = flow

  if (!hasSubmitMethod(activeFlow, 'password')) {
    const profileCsrfToken = getRequiredCsrfToken(activeFlow)
    try {
      const { data } = await ory.updateRegistrationFlow({
        flow: activeFlow.id,
        updateRegistrationFlowBody: {
          method: 'profile',
          csrf_token: profileCsrfToken,
          traits: { email },
        },
      })

      activeFlow = ensureFlowId(data as unknown as FlowWithNodes, 'Registration flow')
    } catch (err) {
      const nextFlow = getFlowFromError<FlowWithNodes & { id?: string }>(err)
      if (!nextFlow) {
        throw err
      }

      activeFlow = ensureFlowId(nextFlow, 'Registration flow')
    }
  }

  const passwordCsrfToken = getRequiredCsrfToken(activeFlow)

  await ory.updateRegistrationFlow({
    flow: activeFlow.id,
    updateRegistrationFlowBody: {
      method: 'password',
      csrf_token: passwordCsrfToken,
      password,
      traits: { email },
    },
  })
}

export async function initRecoveryFlow(): Promise<RecoveryFlow> {
  const { data } = await ory.createBrowserRecoveryFlow()
  return ensureFlowId(data, 'Recovery flow')
}

export async function submitRecoveryEmail(
  flow: RecoveryFlow,
  email: string
): Promise<void> {
  const csrfToken = getRequiredCsrfToken(flow)

  await ory.updateRecoveryFlow({
    flow: flow.id,
    updateRecoveryFlowBody: { method: 'code', csrf_token: csrfToken, email },
  })
}

// ─── Error extraction ───────────────────────────────────────────────────────

const KRATOS_MESSAGES: Record<number, string> = {
  4000006: 'Неверный email или пароль.',
  4000007: 'Аккаунт с таким email уже существует.',
  4000008: 'Неверный код подтверждения. Попробуйте снова.',
  4000010: 'Аккаунт не активирован. Подтвердите email.',
  4000031: 'Пароль слишком похож на email. Придумайте другой.',
  4000032: 'Пароль слишком короткий.',
  4000033: 'Пароль слишком длинный.',
  4000034: 'Этот пароль найден в утечках данных. Придумайте более надёжный.',
  4010001: 'Время сессии входа истекло. Попробуйте снова.',
  4040001: 'Время сессии регистрации истекло. Попробуйте снова.',
  4060004: 'Токен восстановления недействителен или уже использован.',
  4060005: 'Время сессии восстановления истекло. Попробуйте снова.',
  4060006: 'Код восстановления недействителен или уже использован.',
}

interface KratosUiMessage {
  id: number
  text: string
  type: string
}

interface KratosUiNode {
  messages?: KratosUiMessage[]
}

interface KratosErrorPayload {
  ui?: {
    messages?: KratosUiMessage[]
    nodes?: KratosUiNode[]
  }
  error?: {
    id?: string
    reason?: string
    message?: string
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNestedRecord(value: unknown, key: string): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined
  const nested = value[key]
  return isRecord(nested) ? nested : undefined
}

function getErrorPayload(err: unknown): KratosErrorPayload | undefined {
  if (isAxiosError(err)) {
    return err.response?.data as KratosErrorPayload | undefined
  }

  if (isRecord(err) && 'response' in err) {
    const response = getNestedRecord(err, 'response')
    const data = response?.data

    if (isRecord(data)) {
      return data as KratosErrorPayload
    }
  }

  if (isRecord(err) && 'data' in err && isRecord(err.data)) {
    return err.data as KratosErrorPayload
  }

  const causeResponse = getNestedRecord(getNestedRecord(err, 'cause'), 'response')
  if (isRecord(causeResponse?.data)) {
    return causeResponse.data as KratosErrorPayload
  }

  return undefined
}

function getFallbackErrorMessage(err: unknown): string | undefined {
  if (err instanceof Error) {
    const message = err.message.trim()

    if (message && message !== 'Network Error' && !/^Request failed with status code \d+$/.test(message)) {
      return message
    }
  }

  if (typeof err === 'string' && err.trim()) {
    return err
  }

  return undefined
}

export function extractKratosError(err: unknown): string {
  if (err instanceof Error && err.message.endsWith('did not return a valid flow id')) {
    return 'Сервис аутентификации вернул некорректный flow. Обновите страницу и попробуйте снова.'
  }

  if (err instanceof Error && err.message === 'Flow did not return csrf_token') {
    return 'Сервис аутентификации вернул неполный flow. Обновите страницу и попробуйте снова.'
  }

  const data = getErrorPayload(err)
  if (!data) {
    return getFallbackErrorMessage(err) ?? 'Произошла ошибка. Попробуйте снова.'
  }

  const msgs: KratosUiMessage[] = [
    ...(data.ui?.messages ?? []),
    ...(data.ui?.nodes ?? []).flatMap((node) => node.messages ?? []),
  ].filter((message) => message.type === 'error')

  if (msgs.length > 0) {
    return msgs.map((m) => KRATOS_MESSAGES[m.id] ?? m.text).join(' ')
  }

  if (data.error?.id === 'session_already_available') {
    return 'У вас уже есть активная сессия.'
  }

  return data.error?.reason ?? data.error?.message ?? getFallbackErrorMessage(err) ?? 'Произошла ошибка. Попробуйте снова.'
}
