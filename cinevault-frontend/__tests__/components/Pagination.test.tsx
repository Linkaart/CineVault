import { render, screen } from "@testing-library/react";
import Pagination from "@/components/movies/Pagination";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("Pagination", () => {
  it("ne s'affiche pas s'il n'y a qu'une seule page", () => {
    const { container } = render(<Pagination count={15} currentPage={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("affiche les liens précédent/suivant pour plusieurs pages", () => {
    render(<Pagination count={100} currentPage={2} />);
    expect(screen.getByText("← Précédent")).toBeInTheDocument();
    expect(screen.getByText("Suivant →")).toBeInTheDocument();
  });

  it("désactive le lien précédent sur la première page", () => {
    render(<Pagination count={100} currentPage={1} />);
    const prevLink = screen.getByText("← Précédent");
    expect(prevLink).toHaveAttribute("aria-disabled", "true");
  });

  it("désactive le lien suivant sur la dernière page", () => {
    // count=100, PAGE_SIZE=20 -> 5 pages
    render(<Pagination count={100} currentPage={5} />);
    const nextLink = screen.getByText("Suivant →");
    expect(nextLink).toHaveAttribute("aria-disabled", "true");
  });

  it("marque la page courante avec aria-current", () => {
    render(<Pagination count={100} currentPage={3} />);
    const current = screen.getByText("3");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("construit les liens de page avec le bon paramètre d'URL", () => {
    render(<Pagination count={100} currentPage={2} />);
    const page3Link = screen.getByText("3");
    expect(page3Link).toHaveAttribute("href", "/movies?page=3");
  });

  it("omet le paramètre page dans l'URL de la page 1", () => {
    render(<Pagination count={100} currentPage={2} />);
    const page1Link = screen.getByText("1");
    expect(page1Link).toHaveAttribute("href", "/movies");
  });
});
