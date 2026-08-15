"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/lib/api/auth";
import { fetchGenres } from "@/lib/api/genres";
import { ApiError } from "@/lib/api/client";
import { Genre } from "@/lib/types";

export default function ProfileEditPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setSelectedGenres(user.favorite_genres || []);
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  useEffect(() => {
    fetchGenres().then(setGenres).catch(() => setGenres([]));
  }, []);

  function toggleGenre(id: number) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await updateProfile({
        bio,
        favorite_genres: selectedGenres,
        avatarFile,
      });
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer le profil.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <p className="font-display tracking-[0.3em] text-neon text-glow-neon text-xs mb-2">
        DERRIÈRE LE RIDEAU
      </p>
      <h1 className="font-display text-4xl tracking-wide text-paper mb-8">Modifier mon profil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-curtain border border-marquee/30 shrink-0">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display text-2xl text-marquee">
                {user.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <label className="inline-block text-sm px-4 py-2 rounded-full border border-white/15 text-paper/80 hover:border-marquee/50 hover:text-marquee transition cursor-pointer focus-ring">
              Changer la photo
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <p className="text-xs text-smoke mt-1">JPG ou PNG, 5 Mo max.</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-smoke block mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Quelques mots sur tes goûts en cinéma..."
            className="w-full bg-curtain border border-white/10 rounded-md p-3 text-sm text-paper placeholder:text-smoke focus-ring resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-smoke block mb-2">Genres préférés</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const active = selectedGenres.includes(genre.id);
              return (
                <button
                  type="button"
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition focus-ring ${
                    active
                      ? "bg-reel/15 border-reel text-reel"
                      : "border-white/15 text-paper/60 hover:border-reel/40"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
            {genres.length === 0 && (
              <p className="text-xs text-smoke">Aucun genre disponible pour le moment.</p>
            )}
          </div>
        </div>

        {error && <p className="text-neon text-xs">{error}</p>}
        {success && <p className="text-reel text-xs">Profil mis à jour.</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-full bg-marquee text-void text-sm font-semibold shadow-gold hover:brightness-110 transition disabled:opacity-50 focus-ring"
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/users/${user.id}`)}
            className="px-5 py-2.5 rounded-full border border-white/15 text-paper/70 hover:text-paper transition focus-ring"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
