import { useEffect, useState } from 'react';
import { api } from '../api.js';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const selectCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-accent';
const inputCls = selectCls;
const textareaCls = `${selectCls} min-h-[120px] font-mono text-xs leading-relaxed`;

export default function Configuration() {
  const [config, setConfig] = useState(null);
  const [guild, setGuild] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [publishChannel, setPublishChannel] = useState('');

  useEffect(() => {
    Promise.all([api.get('/api/config'), api.get('/api/guild')]).then(([c, g]) => {
      setConfig(c);
      setGuild(g);
      setPublishChannel(c.rules_channel_id || g.channels[0]?.id || '');
    });
  }, []);

  const set = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await api.put('/api/config', config);
      setMsg({ type: 'ok', text: 'Configuration enregistrée.' });
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const publish = async (kind) => {
    if (!publishChannel) return;
    setMsg(null);
    try {
      await api.post(kind === 'rules' ? '/api/publish/rules' : '/api/publish/ticket-panel', {
        channelId: publishChannel,
      });
      setMsg({
        type: 'ok',
        text: kind === 'rules' ? 'Règlement publié.' : 'Panneau de tickets publié.',
      });
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    }
  };

  if (!config || !guild) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const channelOptions = [
    <option key="" value="">
      — Non configuré —
    </option>,
    ...guild.channels.map((c) => (
      <option key={c.id} value={c.id}>
        #{c.name}
      </option>
    )),
  ];
  const categoryOptions = [
    <option key="" value="">
      — Non configuré —
    </option>,
    ...guild.categories.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    )),
  ];
  const roleOptions = [
    <option key="" value="">
      — Non configuré —
    </option>,
    ...guild.roles.map((r) => (
      <option key={r.id} value={r.id}>
        @{r.name}
      </option>
    )),
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Configuration</h1>
        <p className="text-sm text-slate-400">Salons, rôles et messages du bot</p>
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

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-white">Rôles & salons</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rôle membre (après règlement)">
            <select className={selectCls} value={config.member_role_id || ''} onChange={(e) => set('member_role_id', e.target.value || null)}>
              {roleOptions}
            </select>
          </Field>
          <Field label="Rôle staff">
            <select className={selectCls} value={config.staff_role_id || ''} onChange={(e) => set('staff_role_id', e.target.value || null)}>
              {roleOptions}
            </select>
          </Field>
          <Field label="Salon patch notes">
            <select
              className={selectCls}
              value={config.patchnotes_channel_id || ''}
              onChange={(e) => set('patchnotes_channel_id', e.target.value || null)}
            >
              {channelOptions}
            </select>
          </Field>
          <Field label="Salon logs">
            <select className={selectCls} value={config.logs_channel_id || ''} onChange={(e) => set('logs_channel_id', e.target.value || null)}>
              {channelOptions}
            </select>
          </Field>
          <Field label="Catégorie tickets">
            <select
              className={selectCls}
              value={config.tickets_category_id || ''}
              onChange={(e) => set('tickets_category_id', e.target.value || null)}
            >
              {categoryOptions}
            </select>
          </Field>
          <Field label="Catégorie convocations">
            <select
              className={selectCls}
              value={config.convocations_category_id || ''}
              onChange={(e) => set('convocations_category_id', e.target.value || null)}
            >
              {categoryOptions}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-white">Bienvenue</h2>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={!!config.welcome_enabled}
            onChange={(e) => set('welcome_enabled', e.target.checked)}
            className="accent-accent"
          />
          Envoyer un MP à l&apos;arrivée
        </label>
        <Field label="Message ({user} et {server} disponibles)">
          <textarea className={textareaCls} value={config.welcome_message || ''} onChange={(e) => set('welcome_message', e.target.value)} />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-white">Règlement</h2>
        <Field label="Texte du règlement (markdown)">
          <textarea className={textareaCls} value={config.rules_text || ''} onChange={(e) => set('rules_text', e.target.value)} />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-white">Publier un panneau</h2>
        <Field label="Salon de publication">
          <select className={selectCls} value={publishChannel} onChange={(e) => setPublishChannel(e.target.value)}>
            {guild.channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => publish('rules')}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-white hover:border-accent"
          >
            Publier le règlement
          </button>
          <button
            type="button"
            onClick={() => publish('tickets')}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-white hover:border-accent"
          >
            Publier le panneau tickets
          </button>
        </div>
      </section>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  );
}
