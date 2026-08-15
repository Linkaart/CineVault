import { render, screen } from "@testing-library/react";
import RatingStars from "@/components/ui/RatingStars";

/**
 * React ne crée pas de noeud texte pour une chaîne vide, donc quand 0 étoile
 * est pleine, childNodes[0] du conteneur est directement le span imbriqué
 * des étoiles vides. Cet helper cherche explicitement le noeud texte (s'il
 * existe) pour obtenir le nombre exact d'étoiles pleines, y compris le cas 0.
 */
function getFilledStarsText(container: HTMLElement): string {
  const outer = container.querySelector(".text-marquee");
  if (!outer) return "";
  const textNode = Array.from(outer.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
  return textNode?.textContent ?? "";
}

describe("RatingStars", () => {
  it("affiche un message quand aucune note n'existe", () => {
    render(<RatingStars value={null} />);
    expect(screen.getByText("Pas encore noté")).toBeInTheDocument();
  });

  it("affiche la note sur 10 à côté des étoiles", () => {
    render(<RatingStars value={8.4} />);
    expect(screen.getByText("8.4/10")).toBeInTheDocument();
  });

  it("arrondit correctement le nombre d'étoiles pleines (note sur 10 -> 5 étoiles)", () => {
    // 8.4/10 -> 4.2 -> arrondi à 4 étoiles pleines
    const { container } = render(<RatingStars value={8.4} />);
    expect(getFilledStarsText(container)).toBe("★★★★");
  });

  it("affiche 5 étoiles pleines pour la note maximale", () => {
    const { container } = render(<RatingStars value={10} />);
    expect(getFilledStarsText(container)).toBe("★★★★★");
  });

  it("affiche 0 étoile pleine pour une note très basse", () => {
    const { container } = render(<RatingStars value={0.5} />);
    expect(getFilledStarsText(container)).toBe("");
  });

  it("affiche toujours un total de 5 étoiles (pleines + vides)", () => {
    const { container } = render(<RatingStars value={6} />);
    const outer = container.querySelector(".text-marquee");
    expect(outer?.textContent).toHaveLength(5);
  });
});
