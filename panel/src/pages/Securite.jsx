import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Button, Card, Field, Input, PageTitle, Spinner, Toggle } from '../components/ui.jsx';

function NumberField({ label, value, onChange, hint }) {
  return (
    <Field label={label} hint={hint}>
      <Input type="number" min="1" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}

export default function Securite() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/api/config').then(setConfig);
  }, []);

  if (!config) return <Spinner />;

  const set = (key, value) => setConfig((c) => ({ ...c, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/api/config', config);
      setMessage('✅ Paramètres de sécurité enregistrés.');
    } catch (e) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Sécurité" subtitle="Protections automatiques du serveur.">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Enregistrement…' : '💾 Enregistrer'}
        </Button>
      </PageTitle>

      {message && (
        <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3 text-sm">{message}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">💬 Anti-spam</h2>
            <Toggle checked={!!config.antispam_enabled} onChange={(v) => set('antispam_enabled', v)} label="" />
          </div>
          <p className="mb-4 text-sm text-slate-400">
            Mute automatiquement les membres qui envoient trop de messages trop vite.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Max messages"
              value={config.antispam_max_messages}
              onChange={(v) => set('antispam_max_messages', v)}
            />
            <NumberField
              label="Fenêtre (s)"
              value={config.antispam_interval_seconds}
              onChange={(v) => set('antispam_interval_seconds', v)}
            />
            <NumberField
              label="Mute (min)"
              value={config.antispam_mute_minutes}
              onChange={(v) => set('antispam_mute_minutes', v)}
            />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">🚨 Anti-raid</h2>
            <Toggle checked={!!config.antiraid_enabled} onChange={(v) => set('antiraid_enabled', v)} label="" />
          </div>
          <p className="mb-4 text-sm text-slate-400">
            En cas d'arrivées massives, le niveau de vérification du serveur est monté au maximum pendant 10
            minutes.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Max arrivées"
              value={config.antiraid_max_joins}
              onChange={(v) => set('antiraid_max_joins', v)}
            />
            <NumberField
              label="Fenêtre (s)"
              value={config.antiraid_interval_seconds}
              onChange={(v) => set('antiraid_interval_seconds', v)}
            />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">🔗 Anti-invitations</h2>
            <Toggle
              checked={!!config.antiinvite_enabled}
              onChange={(v) => set('antiinvite_enabled', v)}
              label=""
            />
          </div>
          <p className="text-sm text-slate-400">
            Supprime automatiquement les liens d'invitation Discord postés par les membres (le staff est
            exempté).
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">💣 Anti-nuke</h2>
            <Toggle checked={!!config.antinuke_enabled} onChange={(v) => set('antinuke_enabled', v)} label="" />
          </div>
          <p className="mb-4 text-sm text-slate-400">
            Si un membre supprime trop de salons/rôles ou bannit trop de monde d'un coup, ses rôles sont
            retirés automatiquement.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Max actions"
              value={config.antinuke_max_actions}
              onChange={(v) => set('antinuke_max_actions', v)}
            />
            <NumberField
              label="Fenêtre (s)"
              value={config.antinuke_interval_seconds}
              onChange={(v) => set('antinuke_interval_seconds', v)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
