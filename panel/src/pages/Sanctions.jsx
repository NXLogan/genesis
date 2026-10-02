import { useEffect, useState } from 'react';
import { api } from '../api.js';

const EMOJI = { ban: '🔨', kick: '👢', mute: '🔇', unmute: '🔊', warn: '⚠️' };

export default function Sanctions() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get('/api/sanctions').then(setItems);
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
        <h1 className="text-2xl font-bold text-white">Sanctions</h1>
        <p className="text-sm text-slate-400">{items.length} sanction(s)</p>
      </header>

      {items.length === 0 ? (
        <p className="text-slate-400">Aucune sanction enregistrée.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-card text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Modérateur</th>
                <th className="px-4 py-3">Motif</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {EMOJI[s.type] || '❔'} {s.type}
                    {s.duration ? ` (${s.duration})` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-200">{s.user_tag}</td>
                  <td className="px-4 py-3 text-slate-300">{s.moderator_tag}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-400">{s.reason || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{s.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
