import React from 'react'

export const Button = React.forwardRef(({ className, children, variant = 'primary', disabled, ...props }, ref) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800',
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

export const Input = React.forwardRef(({ className, type = 'text', label, error, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
    <input
      ref={ref}
      type={type}
      className={`w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
))

export const Card = ({ className, children, ...props }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-lg p-6 ${className}`} {...props}>
    {children}
  </div>
)

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    orange: 'bg-orange-500/20 text-orange-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const Select = React.forwardRef(({ label, error, children, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
    <select
      ref={ref}
      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
))

export const Textarea = React.forwardRef(({ label, error, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
    <textarea
      ref={ref}
      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
))

export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">{footer}</div>}
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
  return <div className={`${sizes[size]} border-4 border-orange-500 border-t-transparent rounded-full animate-spin`}></div>
}
