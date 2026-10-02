import { Link } from 'react-router-dom';

export default function Accueil() {
  return (
    <>
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-24 pt-28 md:px-10 md:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 70% 10%, rgba(156,59,47,0.08), transparent 55%), radial-gradient(ellipse 60% 50% at 15% 85%, rgba(18,17,15,0.05), transparent 50%), linear-gradient(180deg, #f3efe6 0%, #efe8db 100%)',
          }}
        />

        <div className="mx-auto w-full max-w-4xl">
          <p className="animate-rise font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
            Serveur roleplay · GTA 5 · Bientôt GTA 6
          </p>

          <h1 className="animate-rise-delay mt-7 max-w-[16ch] font-display text-[2.75rem] font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl md:text-[4.15rem]">
            Un serveur pensé pour durer — de GTA 5 jusqu&apos;à GTA 6.
          </h1>

          <p className="animate-rise-delay-2 mt-7 max-w-xl font-sans text-base leading-relaxed text-ink-soft md:text-[1.05rem]">
            GENESIS est né sur GTA 5, et sera parmi les premiers à ouvrir sur GTA 6. Roleplay, lore de
            Saint-Écho, boutique et streams.
          </p>

          <div className="animate-rise-delay-2 mt-10 flex flex-wrap items-center gap-6">
            <Link
              to="/stream"
              className="bg-ink px-6 py-3 font-sans text-[0.78rem] font-semibold tracking-[0.06em] text-paper transition hover:bg-ink-soft"
            >
              Voir les films
            </Link>
            <Link
              to="/boutique"
              className="font-sans text-[0.9rem] font-medium text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
            >
              La boutique
            </Link>
          </div>
        </div>

        <div className="scroll-hint absolute bottom-8 left-6 md:left-10">
          <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            Faire défiler
          </span>
        </div>
      </section>

      <section className="border-t border-ink/10 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2 md:gap-20">
          <div>
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
              Pourquoi Genesis
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              Une ville, une mémoire, une continuité.
            </h2>
          </div>
          <div className="space-y-5 font-sans text-[0.95rem] leading-relaxed text-ink-soft">
            <p>
              Saint-Écho n’est pas un décor jetable. C’est un territoire écrit pour tenir dans le temps —
              sur GTA 5 d’abord, puis sur GTA 6 quand les portes s’ouvriront.
            </p>
            <p>
              Staff stable, lore cohérent, économie soignée : on construit un serveur où les personnages
              laissent une trace, pas une session.
            </p>
            <Link to="/lore" className="inline-block pt-2 font-medium text-ember hover:text-ember-soft">
              Explorer le lore →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-20 text-paper md:px-10 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-paper/50">
              Rejoindre
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Prêt à écrire ta page à Saint-Écho ?
            </h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://discord.gg/"
              target="_blank"
              rel="noreferrer"
              className="bg-paper px-6 py-3 font-sans text-[0.78rem] font-semibold tracking-[0.06em] text-ink transition hover:bg-paper-deep"
            >
              Discord
            </a>
            <Link
              to="/reglement"
              className="border border-paper/40 px-6 py-3 font-sans text-[0.78rem] font-semibold tracking-[0.06em] text-paper transition hover:border-paper"
            >
              Lire le règlement
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
