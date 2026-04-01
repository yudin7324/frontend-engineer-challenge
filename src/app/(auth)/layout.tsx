import { Logo } from '@/shared/ui/Logo'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#E2E2E2]">
      <div className="relative flex flex-col w-[420px] shrink-0 bg-white px-10 py-8">
        <Logo />
        <div className="flex flex-1 items-center">
          {children}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 320,
            height: 320,
            background: 'rgba(255,255,255,0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(2px)',
          }}
        />
        <div
          className="absolute rounded-full bg-[#4B96E8]"
          style={{ width: 52, height: 52, top: 'calc(50% - 140px)', left: 'calc(50% + 100px)' }}
        />
        <div
          className="absolute rounded-full bg-[#4B96E8]"
          style={{ width: 36, height: 36, top: 'calc(50% + 110px)', left: 'calc(50% - 130px)' }}
        />
      </div>
    </div>
  )
}
