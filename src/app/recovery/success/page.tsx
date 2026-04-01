import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Пароль восстановлен — Orbitto' }

export default function RecoverySuccessPage() {
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-3">Пароль был восстановлен</h1>
      <p className="text-sm text-gray-500 mb-8">
        Перейдите на страницу авторизации, чтобы войти в систему с новым паролем
      </p>
      <Link
        href="/sign-in"
        className="block w-full py-2.5 px-4 rounded text-sm font-medium text-center text-[#4B96E8] border border-[#4B96E8] hover:bg-blue-50 transition-colors"
      >
        Назад к авторизации
      </Link>
    </div>
  )
}
