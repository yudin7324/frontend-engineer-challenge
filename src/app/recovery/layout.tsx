import type { ReactNode } from 'react'

export default function RecoveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#E2E2E2] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[500px] rounded px-12 py-12 shadow-sm">
        {children}
      </div>
    </div>
  )
}
