import { SHOP_ITEMS, useCart } from '../cart.jsx';

export default function Boutique() {
  const { add } = useCart();

  return (
    <section className="px-6 pb-24 pt-32 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="animate-rise font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
          Boutique
        </p>
        <h1 className="animate-rise-delay mt-5 font-display text-5xl leading-tight text-ink md:text-6xl">
          Soutenir Genesis
        </h1>
        <p className="animate-rise-delay-2 mt-6 font-sans text-base leading-relaxed text-ink-soft">
          Des packs cosmétiques et de confort — jamais de pay-to-win. Les fonds servent le serveur et la
          migration GTA 6.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
        {SHOP_ITEMS.map((item, i) => (
          <article
            key={item.id}
            className="flex flex-col border border-ink/15 bg-paper-deep/40 p-7"
            style={{ animation: `rise 0.8s cubic-bezier(0.22,1,0.36,1) ${0.08 * i}s both` }}
          >
            <h2 className="font-display text-2xl text-ink">{item.name}</h2>
            <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-ink-soft">{item.blurb}</p>
            <div className="mt-8 flex items-center justify-between gap-4">
              <span className="font-sans text-lg font-semibold tabular-nums text-ink">
                {item.price.toFixed(2).replace('.', ',')} €
              </span>
              <button
                type="button"
                onClick={() => add(item.id)}
                className="bg-ink px-4 py-2.5 font-sans text-[0.72rem] font-semibold tracking-[0.06em] text-paper transition hover:bg-ink-soft"
              >
                Ajouter
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
