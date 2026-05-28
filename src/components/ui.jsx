// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }) {
  const base = 'bg-surface rounded-lg border border-bdr shadow-card transition-all duration-150'
  const interactive = onClick ? 'cursor-pointer hover:shadow-card-hover' : ''
  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="sticky top-0 z-10 bg-surface border-b border-bdr px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold text-ink-primary">{title}</h1>
        {subtitle && <p className="text-sm text-ink-secondary mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = 'primary', size = 'md',
  type = 'button', className = '', disabled = false,
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-brand text-white hover:bg-brand-hover shadow-sm',
    secondary: 'bg-surface border border-bdr text-ink-secondary hover:bg-surface-hover shadow-sm',
    danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    ghost:     'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  }
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-ink-primary">{label}</label>}
      <input
        className={`
          border rounded-md px-3 py-2 text-sm text-ink-primary bg-surface
          focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
          placeholder:text-ink-muted transition-all duration-150
          ${error ? 'border-red-400' : 'border-bdr'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-ink-primary">{label}</label>}
      <select
        className={`
          border rounded-md px-3 py-2 text-sm text-ink-primary bg-surface
          focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
          transition-all duration-150
          ${error ? 'border-red-400' : 'border-bdr'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-ink-primary">{label}</label>}
      <textarea
        className={`
          border rounded-md px-3 py-2 text-sm text-ink-primary bg-surface
          focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
          placeholder:text-ink-muted resize-none transition-all duration-150
          ${error ? 'border-red-400' : 'border-bdr'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md animate-in fade-in duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bdr">
          <h3 className="font-semibold text-ink-primary">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-all duration-150 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue:  'bg-brand-light text-brand',
    teal:  'bg-cat-mint/30 text-teal-700',
    green: 'bg-cat-mint/30 text-teal-700',
    red:   'bg-red-100 text-red-700',
    slate: 'bg-surface-hover text-ink-secondary',
    amber: 'bg-cat-yellow/40 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] ?? colors.slate}`}>
      {children}
    </span>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mb-4 text-2xl">
        {icon}
      </div>
      <h3 className="font-semibold text-ink-primary mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-xs">{description}</p>
    </div>
  )
}

// ── Table helpers ─────────────────────────────────────────────────────────────
export const TH = 'px-6 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide'
export const TD = 'px-6 py-4'
export const TR_HOVER = 'border-t border-bdr hover:bg-surface-hover transition-colors duration-150'
