import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { User } from "@/lib/types";
import ProfileActions from "@/components/users/ProfileActions";
import CompatibilityCard from "@/components/users/CompatibilityCard";

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  let profile: User;
  try {
    profile = await apiFetch<User>(`/users/${params.id}/`, { auth: false });
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-curtain border border-marquee/30 overflow-hidden flex items-center justify-center font-display text-3xl text-marquee">
        {profile!.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile!.avatar} alt={profile!.username} className="w-full h-full object-cover" />
        ) : (
          profile!.username[0]?.toUpperCase()
        )}
      </div>
      <h1 className="font-display text-4xl tracking-wide text-paper mb-1">{profile!.username}</h1>
      {profile!.bio && <p className="text-paper/70 max-w-md mx-auto mb-4">{profile!.bio}</p>}

      <div className="flex justify-center gap-8 text-sm text-smoke mb-6">
        <div>
          <span className="block text-marquee font-display text-xl">{profile!.reviews_count}</span>
          Critiques
        </div>
        <div>
          <span className="block text-marquee font-display text-xl">{profile!.followers_count}</span>
          Abonnés
        </div>
        <div>
          <span className="block text-marquee font-display text-xl">{profile!.following_count}</span>
          Abonnements
        </div>
      </div>

      {profile!.top_genres.length > 0 && (
        <div className="mb-6">
          <p className="text-xs tracking-[0.2em] text-smoke mb-2">GENRES DE PRÉDILECTION</p>
          <div className="flex flex-wrap justify-center gap-2">
            {profile!.top_genres.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 rounded-full border border-marquee/30 text-marquee text-xs"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <ProfileActions userId={profile!.id} />
      <CompatibilityCard userId={profile!.id} />
    </div>
  );
}
