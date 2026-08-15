import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewForm from "@/components/reviews/ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import { createReview } from "@/lib/api/reviews";
import { ApiError } from "@/lib/api/client";

jest.mock("@/hooks/useAuth");
jest.mock("@/lib/api/reviews");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedCreateReview = createReview as jest.MockedFunction<typeof createReview>;

function mockAuthed() {
  mockedUseAuth.mockReturnValue({
    user: { id: 1, username: "alice" } as never,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  });
}

function mockAnonymous() {
  mockedUseAuth.mockReturnValue({
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  });
}

describe("ReviewForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("invite à se connecter si l'utilisateur n'est pas authentifié", () => {
    mockAnonymous();
    render(<ReviewForm movieId={1} onSuccess={jest.fn()} />);
    expect(screen.getByText(/connecte-toi pour publier une critique/i)).toBeInTheDocument();
  });

  it("n'affiche pas le formulaire si non connecté", () => {
    mockAnonymous();
    render(<ReviewForm movieId={1} onSuccess={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /publier la critique/i })).not.toBeInTheDocument();
  });

  it("affiche le formulaire avec une note par défaut de 7/10", () => {
    mockAuthed();
    render(<ReviewForm movieId={1} onSuccess={jest.fn()} />);
    expect(screen.getByText(/7\/10/)).toBeInTheDocument();
  });

  it("appelle createReview puis onSuccess lors de la soumission", async () => {
    mockAuthed();
    mockedCreateReview.mockResolvedValueOnce({
      id: 1,
      movie: 1,
      movie_title: "Blade Runner",
      user: 1,
      user_username: "alice",
      rating: 7,
      content: "Superbe film",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    const onSuccess = jest.fn();
    const user = userEvent.setup();

    render(<ReviewForm movieId={1} onSuccess={onSuccess} />);

    await user.type(screen.getByPlaceholderText(/qu'as-tu pensé/i), "Superbe film");
    await user.click(screen.getByRole("button", { name: /publier la critique/i }));

    await waitFor(() => {
      expect(mockedCreateReview).toHaveBeenCalledWith({
        movie: 1,
        rating: 7,
        content: "Superbe film",
      });
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("affiche un message d'erreur si la création échoue", async () => {
    mockAuthed();
    mockedCreateReview.mockRejectedValueOnce(
      new ApiError(400, { detail: "Tu as déjà publié une critique pour ce film." })
    );
    const user = userEvent.setup();

    render(<ReviewForm movieId={1} onSuccess={jest.fn()} />);
    await user.click(screen.getByRole("button", { name: /publier la critique/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Tu as déjà publié une critique pour ce film.")
      ).toBeInTheDocument();
    });
  });
});
