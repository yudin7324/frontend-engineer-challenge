import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Проверьте почту — Orbitto' }

export default function CheckEmailPage() {
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-3">Проверьте свою почту</h1>
      <p className="text-sm text-gray-500 mb-8">
        Мы отправили на почту письмо с ссылкой для восстановления пароля
      </p>
      <Link
        href="/sign-in"
        className="block w-full py-2.5 px-4 rounded text-sm font-medium text-center text-[#4B96E8] border border-[#4B96E8] hover:bg-blue-50 transition-colors"
      >
        Вернуться к входу
      </Link>
    </div>
  )
}
