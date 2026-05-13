import React from 'react'

export const Button = React.forwardRef(({ className = '', children, variant = 'primary', disabled, ...props }, ref) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

export const Input = React.forwardRef(({ className = '', type = 'text', label, error, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
    <input
      ref={ref}
      type={type}
      className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${className}`}
      {...props}
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
))

export const Card = ({ className = '', children, ...props }) => (
  <div className={`bg-white border border-slate-200 rounded-lg p-6 shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-sky-100 text-sky-700',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}

export const Select = React.forwardRef(({ label, error, children, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
    <select
      ref={ref}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
))

export const Textarea = React.forwardRef(({ label, error, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
    <textarea
      ref={ref}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
      {...props}
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
))

export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full mx-4 shadow-lg">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">X</button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return <div className={`${sizes[size]} border-4 border-slate-300 border-t-orange-500 rounded-full animate-spin`}></div>
}
