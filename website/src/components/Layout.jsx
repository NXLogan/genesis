import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../cart.jsx';

const LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/lore', label: 'Lore' },
  { to: '/reglement', label: 'Règlement' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/faq', label: 'FAQ' },
  { to: '/stream', label: 'Stream' },
];

export default function Layout({ children }) {
  const { count } = useCart();

  return (
    <div className="relative min-h-screen">
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-7 md:px-10">
          <Link
            to="/"
            className="font-display text-[1.85rem] font-medium tracking-[-0.02em] text-ink transition hover:opacity-70"
          >
            Genesis
          </Link>

          <nav className="hidden items-center gap-7 md:flex lg:gap-9">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'font-sans text-[0.78rem] font-medium tracking-[0.04em] transition',
                    isActive ? 'text-ember' : 'text-ink-soft hover:text-ink',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/panier"
            className="inline-flex items-center gap-2 border border-ink/80 px-3.5 py-1.5 font-sans text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink transition hover:bg-ink hover:text-paper"
          >
            Panier
            {count > 0 && <span className="tabular-nums">({count})</span>}
          </Link>
        </div>

        <nav className="flex gap-4 overflow-x-auto border-t border-ink/10 px-6 py-3 md:hidden">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  'whitespace-nowrap font-sans text-[0.72rem] font-medium tracking-[0.04em]',
                  isActive ? 'text-ember' : 'text-ink-soft',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-ink/10 px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display text-3xl text-ink">Genesis</div>
            <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed text-muted">
              Serveur roleplay — GTA 5 aujourd’hui, GTA 6 demain. Lore de Saint-Écho.
            </p>
          </div>
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-muted">
            © {new Date().getFullYear()} Genesis
          </p>
        </div>
      </footer>
    </div>
  );
}
