export function PageTitle({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${className}`}>{children}</div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white',
    secondary: 'bg-card-hover hover:bg-border text-slate-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-accent ${props.className ?? ''}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-accent ${props.className ?? ''}`}
    />
  );
}

export function Select({ options, placeholder, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
    >
      <option value="">{placeholder ?? '— Non défini —'}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-accent' : 'bg-border'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    green: 'bg-green-500/15 text-green-400',
    red: 'bg-red-500/15 text-red-400',
    yellow: 'bg-yellow-500/15 text-yellow-400',
    blue: 'bg-blue-500/15 text-blue-400',
    slate: 'bg-slate-500/15 text-slate-400',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

export function EmptyState({ icon, message }) {
  return (
    <div className="py-16 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
