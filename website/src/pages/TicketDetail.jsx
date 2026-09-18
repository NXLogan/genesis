import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Badge, Card, EmptyState, PageTitle, Spinner } from '../components/ui.jsx';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/tickets/${id}`).then(setTicket).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-400">❌ {error}</p>;
  if (!ticket) return <Spinner />;

  return (
    <div>
      <PageTitle
        title={`Ticket #${String(ticket.id).padStart(4, '0')}`}
        subtitle={`Ouvert par ${ticket.user_tag} · ${ticket.created_at}`}
      >
        <div className="flex items-center gap-3">
          <Badge color={ticket.status === 'open' ? 'green' : 'slate'}>
            {ticket.status === 'open' ? 'Ouvert' : 'Fermé'}
          </Badge>
          <Link to="/tickets" className="text-sm text-accent hover:underline">
            ← Retour
          </Link>
        </div>
      </PageTitle>

      {ticket.status === 'closed' && (
        <Card className="mb-6">
          <div className="text-sm text-slate-300">
            🔒 Fermé le {ticket.closed_at} par <span className="text-white">{ticket.closed_by_tag}</span>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-semibold text-white">💬 Transcript ({ticket.messages.length} messages)</h2>
        {ticket.messages.length === 0 ? (
          <EmptyState icon="💬" message="Aucun message enregistré dans ce ticket." />
        ) : (
          <div className="space-y-3">
            {ticket.messages.map((m) => (
              <div key={m.id} className="rounded-lg bg-surface p-3">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white">{m.author_tag}</span>
                  <span className="text-xs text-slate-500">{m.created_at}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-300">{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
