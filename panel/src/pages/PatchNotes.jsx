import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function PatchNotes() {
  const [notes, setNotes] = useState(null);
  const [form, setForm] = useState({ version: '', title: '', content: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => api.get('/api/patchnotes').then(setNotes);
  useEffect(() => {
    load();
  }, []);

  const publish = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api.post('/api/patchnotes', form);
      setForm({ version: '', title: '', content: '' });
      setMsg({ type: 'ok', text: 'Patch note publié sur Discord.' });
      await load();
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  if (!notes) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Patch Notes</h1>
        <p className="text-sm text-slate-400">Rédiger et publier une mise à jour</p>
      </header>

      {msg && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            msg.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={publish} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Version</span>
            <input
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="v1.2.0"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Titre</span>
            <input
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Nouveautés"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Contenu</span>
          <textarea
            required
            rows={8}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            placeholder={"- Nouveau système X\n- Correction de Y"}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? 'Publication…' : 'Publier'}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold text-white">Historique</h2>
        {notes.length === 0 && <p className="text-slate-400">Aucun patch note.</p>}
        {notes.map((n) => (
          <article key={n.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-medium text-white">
                {n.version} — {n.title}
              </h3>
              <span className="text-xs text-slate-500">
                {n.author_tag} · {n.published_at}
              </span>
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-300">{n.content}</pre>
          </article>
        ))}
      </section>
    </div>
  );
}
