import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Convocations() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get('/api/convocations').then(setItems);
  }, []);

  if (!items) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Convocations</h1>
        <p className="text-sm text-slate-400">{items.length} convocation(s)</p>
      </header>

      {items.length === 0 ? (
        <p className="text-slate-400">Aucune convocation.</p>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-white">
                    #{c.id} — {c.user_tag}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    Par {c.staff_tag} · {c.created_at}
                    {c.closed_at ? ` · Close le ${c.closed_at}` : ''}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.status === 'open' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{c.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
