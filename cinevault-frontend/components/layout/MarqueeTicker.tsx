"use client";

/**
 * Élément signature : un bandeau façon enseigne de cinéma qui défile,
 * comme les lettres mobiles d'une marquee à l'entrée d'une salle.
 */
const ITEMS = [
  "★ NOUVELLES CRITIQUES CHAQUE JOUR",
  "CE SOIR : RECOMMANDATIONS PERSONNALISÉES",
  "REJOINS LA SALLE — NOTE TON PREMIER FILM",
  "LISTES À LA UNE CETTE SEMAINE",
];

export default function MarqueeTicker() {
  const track = [...ITEMS, ...ITEMS];
  return (
    <div className="w-full overflow-hidden bg-neon/10 border-b border-neon/20 py-1.5">
      <div className="flex whitespace-nowrap animate-marquee">
        {track.map((item, i) => (
          <span
            key={i}
            className="mx-6 text-xs tracking-[0.2em] font-display text-neon text-glow-neon"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
