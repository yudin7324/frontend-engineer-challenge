import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'ghost'
}

export function Button({ loading, variant = 'primary', className = '', children, disabled, ...props }: ButtonProps) {
  const base = 'w-full py-2.5 px-4 rounded text-sm font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[#4B96E8] text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline-[#4B96E8]',
    ghost: 'text-[#4B96E8] hover:underline',
  }

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}
