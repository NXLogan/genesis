const FILMS = [
  {
    title: 'Teaser — Saint-Écho',
    meta: 'Cinématique · 2026',
    note: 'L’entrée dans la ville. Brouillard, docks, sirènes au loin.',
  },
  {
    title: 'Documentaire staff',
    meta: 'Coulisses · 12 min',
    note: 'Comment on écrit le lore, les events, et la migration GTA 6.',
  },
  {
    title: 'Highlights RP',
    meta: 'Communauté',
    note: 'Les scènes marquantes filmées par les joueurs et streamers.',
  },
];

export default function Stream() {
  return (
    <section className="px-6 pb-24 pt-32 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="animate-rise font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
          Stream & films
        </p>
        <h1 className="animate-rise-delay mt-5 font-display text-5xl leading-tight text-ink md:text-6xl">
          Voir Saint-Écho en mouvement
        </h1>
        <p className="animate-rise-delay-2 mt-6 font-sans text-base leading-relaxed text-ink-soft">
          Teasers, lives partenaires et archives RP. Les liens directs seront branchés dès que les
          sorties seront publiques.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-4xl space-y-4">
        {FILMS.map((film, i) => (
          <article
            key={film.title}
            className="flex flex-col gap-4 border border-ink/15 bg-gradient-to-br from-ink/[0.04] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ animation: `rise 0.8s cubic-bezier(0.22,1,0.36,1) ${0.08 * i}s both` }}
          >
            <div>
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
                {film.meta}
              </p>
              <h2 className="mt-2 font-display text-2xl text-ink">{film.title}</h2>
              <p className="mt-2 font-sans text-sm text-ink-soft">{film.note}</p>
            </div>
            <button
              type="button"
              disabled
              className="shrink-0 border border-ink/30 px-5 py-2.5 font-sans text-[0.72rem] font-semibold tracking-[0.06em] text-muted"
              title="Bientôt disponible"
            >
              Bientôt
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
