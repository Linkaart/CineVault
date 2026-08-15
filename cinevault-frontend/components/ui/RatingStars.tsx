export default function RatingStars({ value, size = "sm" }: { value: number | null; size?: "sm" | "lg" }) {
  if (value === null) {
    return <span className="text-smoke text-xs">Pas encore noté</span>;
  }
  const stars = Math.round(value / 2); // note sur 10 -> 5 étoiles
  const textSize = size === "lg" ? "text-lg" : "text-sm";
  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className="text-marquee text-glow-gold" aria-hidden>
        {"★".repeat(stars)}
        <span className="text-white/15">{"★".repeat(5 - stars)}</span>
      </span>
      <span className="text-paper/70 text-xs">{value.toFixed(1)}/10</span>
    </div>
  );
}
