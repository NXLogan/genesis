import { Link } from 'react-router-dom';
import { useCart } from '../cart.jsx';

export default function Panier() {
  const { lines, total, add, remove, clear, count } = useCart();

  return (
    <section className="px-6 pb-24 pt-32 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="animate-rise font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
          Panier
        </p>
        <h1 className="animate-rise-delay mt-5 font-display text-5xl leading-tight text-ink md:text-6xl">
          {count === 0 ? 'Ton panier est vide' : 'Ton panier'}
        </h1>

        {count === 0 ? (
          <div className="mt-10">
            <p className="font-sans text-ink-soft">Parcours la boutique pour soutenir le serveur.</p>
            <Link
              to="/boutique"
              className="mt-8 inline-block bg-ink px-6 py-3 font-sans text-[0.78rem] font-semibold tracking-[0.06em] text-paper"
            >
              Aller à la boutique
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-6">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6"
              >
                <div>
                  <h2 className="font-display text-2xl text-ink">{line.name}</h2>
                  <p className="mt-1 font-sans text-sm text-muted">
                    {line.price.toFixed(2).replace('.', ',')} € × {line.qty}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => remove(line.id)}
                    className="border border-ink/25 px-3 py-1 font-sans text-sm"
                    aria-label="Retirer"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-sans tabular-nums">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => add(line.id)}
                    className="border border-ink/25 px-3 py-1 font-sans text-sm"
                    aria-label="Ajouter"
                  >
                    +
                  </button>
                  <span className="ml-4 min-w-[4.5rem] text-right font-sans font-semibold tabular-nums">
                    {line.total.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <button type="button" onClick={clear} className="font-sans text-sm text-muted underline">
                Vider le panier
              </button>
              <div className="text-right">
                <p className="font-sans text-sm text-muted">Total</p>
                <p className="font-display text-4xl text-ink">{total.toFixed(2).replace('.', ',')} €</p>
                <button
                  type="button"
                  className="mt-4 bg-ink px-6 py-3 font-sans text-[0.78rem] font-semibold tracking-[0.06em] text-paper"
                  onClick={() => alert('Paiement à brancher (Tebex / Stripe).')}
                >
                  Payer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
