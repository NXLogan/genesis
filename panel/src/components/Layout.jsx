import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/configuration', label: 'Configuration', icon: '⚙️' },
  { to: '/tickets', label: 'Tickets', icon: '🎫' },
  { to: '/convocations', label: 'Convocations', icon: '📣' },
  { to: '/patchnotes', label: 'Patch Notes', icon: '🛠️' },
  { to: '/sanctions', label: 'Sanctions', icon: '🔨' },
  { to: '/securite', label: 'Sécurité', icon: '🛡️' },
];

export default function Layout({ user, children }) {
  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <span className="text-2xl">🎮</span>
          <div>
            <div className="font-bold text-white">Bot GTA6</div>
            <div className="text-xs text-slate-400">Panel d'administration</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-slate-300 hover:bg-card-hover hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-9 w-9 rounded-full" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">
                {user.globalName || user.username}
              </div>
              <button onClick={logout} className="text-xs text-slate-400 hover:text-red-400">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
