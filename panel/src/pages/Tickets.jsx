import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const STATUS = {
  open: 'bg-emerald-500/15 text-emerald-300',
  closed: 'bg-slate-500/15 text-slate-400',
};

export default function Tickets() {
  const [tickets, setTickets] = useState(null);

  useEffect(() => {
    api.get('/api/tickets').then(setTickets);
  }, []);

  if (!tickets) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Tickets</h1>
        <p className="text-sm text-slate-400">{tickets.length} ticket(s)</p>
      </header>

      {tickets.length === 0 ? (
        <p className="text-slate-400">Aucun ticket pour le moment.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-card text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-card/60">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="font-medium text-accent hover:underline">
                      #{String(t.id).padStart(4, '0')}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{t.user_tag}</td>
                  <td className="px-4 py-3 capitalize text-slate-300">{t.category}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[t.status] || STATUS.closed}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{t.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
