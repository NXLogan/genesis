const FAQS = [
  {
    q: 'Genesis est-il déjà ouvert ?',
    a: 'Oui sur GTA 5 / FiveM. L’ouverture GTA 6 suivra dès que la plateforme le permettra — les personnages et le lore sont pensés pour migrer.',
  },
  {
    q: 'Faut-il whitelist ?',
    a: 'Oui. La candidature passe par Discord : background de personnage, motivation, et un entretien court.',
  },
  {
    q: 'Y a-t-il du pay-to-win ?',
    a: 'Non. La boutique propose du cosmétique, du confort et du soutien serveur — jamais d’avantage combat ou économie déloyale.',
  },
  {
    q: 'Où voir les streams ?',
    a: 'Sur la page Stream, et en live sur les chaînes partenaires annoncées Discord.',
  },
  {
    q: 'Comment contacter le staff ?',
    a: 'Ouvre un ticket sur Discord. Les convocations et sanctions sont aussi gérées depuis le panel staff.',
  },
];

export default function Faq() {
  return (
    <section className="px-6 pb-24 pt-32 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="animate-rise font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted">
          FAQ
        </p>
        <h1 className="animate-rise-delay mt-5 font-display text-5xl leading-tight text-ink md:text-6xl">
          Questions fréquentes
        </h1>

        <div className="mt-14 divide-y divide-ink/15 border-y border-ink/15">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-6">
              <summary className="cursor-pointer list-none font-display text-2xl text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-1 font-sans text-sm text-muted transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
