import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Ошибка восстановления — Orbitto' }

export default function RecoveryErrorPage() {
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-3">Пароль не был восстановлен</h1>
      <p className="text-sm text-gray-500 mb-8">
        Не удалось установить новый пароль. Попробуйте запросить восстановление заново.
      </p>
      <Link
        href="/sign-in"
        className="block w-full py-2.5 px-4 rounded text-sm font-medium text-center bg-[#4B96E8] text-white hover:opacity-90 transition-opacity mb-3"
      >
        Войти с прежним паролем
      </Link>
      <Link
        href="/recovery"
        className="block w-full py-2.5 text-sm text-center text-[#4B96E8] hover:underline"
      >
        Попробовать снова
      </Link>
    </div>
  )
}
