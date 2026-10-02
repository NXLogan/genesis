import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

function Stat({ label, value, hint, to }) {
  const content = (
    <div className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/40">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/api/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!stats) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const { guild } = stats;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        {guild.icon && <img src={guild.icon} alt="" className="h-14 w-14 rounded-2xl" />}
        <div>
          <h1 className="text-2xl font-bold text-white">{guild.name}</h1>
          <p className="text-sm text-slate-400">Tableau de bord · Bot GTA6</p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          <span className={`h-2 w-2 rounded-full ${stats.musicOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          Musique {stats.musicOnline ? 'en ligne' : 'hors ligne'}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Membres" value={guild.memberCount} hint={`${guild.channels} salons · ${guild.roles} rôles`} />
        <Stat label="Tickets ouverts" value={stats.openTickets} hint={`${stats.totalTickets} au total`} to="/tickets" />
        <Stat label="Sanctions (7j)" value={stats.recentSanctions} to="/sanctions" />
        <Stat
          label="Convocations ouvertes"
          value={stats.openConvocations}
          hint={`${stats.totalPatchNotes} patch notes`}
          to="/convocations"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/configuration"
          className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/50"
        >
          <div className="text-lg">⚙️ Configuration</div>
          <p className="mt-1 text-sm text-slate-400">Salons, rôles, messages de bienvenue et règlement</p>
        </Link>
        <Link to="/patchnotes" className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/50">
          <div className="text-lg">🛠️ Patch Notes</div>
          <p className="mt-1 text-sm text-slate-400">Rédiger et publier une mise à jour</p>
        </Link>
        <Link to="/securite" className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/50">
          <div className="text-lg">🛡️ Sécurité</div>
          <p className="mt-1 text-sm text-slate-400">Anti-spam, anti-raid, anti-nuke</p>
        </Link>
      </div>
    </div>
  );
}
