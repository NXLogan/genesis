const RULES = [
  {
    title: 'Respect & immersion',
    items: [
      'Reste en personnage dans les salons RP.',
      'Pas de metagaming, powergaming ou fail RP volontaire.',
      'Le fair-play prime sur la victoire.',
    ],
  },
  {
    title: 'Violence & crime',
    items: [
      'Toute action violente doit être motivée par le lore.',
      'Pas de free kill / free shoot.',
      'Les enlèvements et braquages suivent les procédures staff.',
    ],
  },
  {
    title: 'Communauté',
    items: [
      'Interdit : harcèlement, discrimination, doxxing.',
      'Les conflits OOC se règlent en ticket, pas en public.',
      'Le staff a le dernier mot sur les sanctions.',
    ],
  },
];

export default function Reglement() {
  return (
    <section className="px-6 pb-24 pt-32 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="animate-rise font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
          Règlement
        </p>
        <h1 className="animate-rise-delay mt-5 font-display text-5xl leading-tight text-ink md:text-6xl">
          Les règles du jeu
        </h1>
        <p className="animate-rise-delay-2 mt-6 font-sans text-base leading-relaxed text-ink-soft">
          Lire le règlement, c’est respecter ceux qui jouent. Version courte — le détail complet est sur
          Discord.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-3xl space-y-12">
        {RULES.map((block) => (
          <div key={block.title} className="border-t border-ink/15 pt-8">
            <h2 className="font-display text-3xl text-ink">{block.title}</h2>
            <ul className="mt-5 space-y-3">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3 font-sans text-sm leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
