const CHAPTERS = [
  {
    title: 'Saint-Écho',
    body: 'Port industriel, quartiers oubliés, néons fatigués. Saint-Écho est une ville côtière où chaque rue a une dette, un secret, ou les deux.',
  },
  {
    title: 'Les factions',
    body: 'Syndicats, crews de rue, cabinets d’avocats douteux, médias locaux : le pouvoir ne se voit pas toujours — il se négocie.',
  },
  {
    title: 'La migration GTA 6',
    body: 'Les histoires commencées sur GTA 5 ne s’effacent pas. Elles traversent. GENESIS est conçu pour que ton personnage survive au changement de monde.',
  },
];

export default function Lore() {
  return (
    <section className="px-6 pb-24 pt-32 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="animate-rise font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
          Lore
        </p>
        <h1 className="animate-rise-delay mt-5 font-display text-5xl leading-tight text-ink md:text-6xl">
          La mémoire de Saint-Écho
        </h1>
        <p className="animate-rise-delay-2 mt-6 font-sans text-base leading-relaxed text-ink-soft">
          Un univers écrit pour le roleplay long format — intrigues, alliances, trahisons, et un fil rouge
          qui relie GTA 5 à GTA 6.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-10 md:grid-cols-3">
        {CHAPTERS.map((c, i) => (
          <article
            key={c.title}
            className="border-t border-ink/20 pt-6"
            style={{ animation: `rise 0.8s cubic-bezier(0.22,1,0.36,1) ${0.1 * i}s both` }}
          >
            <h2 className="font-display text-2xl text-ink">{c.title}</h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-ink-soft">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
