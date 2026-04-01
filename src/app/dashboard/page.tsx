import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/shared/lib/session'
import { SignOutButton } from '@/modules/auth/ui/SignOutButton'

export default async function DashboardPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="rounded-[32px] border border-white/55 bg-[var(--panel)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Session Overview
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Вы вошли в систему
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Этот экран подтверждает успешную интеграцию клиента с Ory Kratos через session cookie и server-side проверку `whoami`.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-white/55 bg-white/78 p-6 shadow-[0_18px_56px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-900">Пользователь</p>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Email</dt>
                <dd className="mt-1 text-base text-slate-900">{session.email ?? 'Не передан в traits'}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Identity ID</dt>
                <dd className="mt-1 break-all text-sm text-slate-700">{session.id}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Сессия</dt>
                <dd className="mt-1 text-sm text-slate-700">{session.active ? 'Активна' : 'Неактивна'}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Истекает</dt>
                <dd className="mt-1 text-sm text-slate-700">{session.expiresAt ?? 'Неизвестно'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[28px] border border-white/55 bg-white/78 p-6 shadow-[0_18px_56px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-900">Почему это важно</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>Клиент не хранит чувствительные данные в localStorage.</li>
              <li>Доступ к защищённым страницам опирается на cookie и `whoami`.</li>
              <li>Экран помогает быстро проверить happy path после регистрации и входа.</li>
            </ul>
            <div className="mt-8">
              <SignOutButton />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
