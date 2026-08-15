"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { fetchWatchlists, createWatchlist } from "@/lib/api/watchlists";
import { WatchList } from "@/lib/types";

export default function WatchlistsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<WatchList[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  async function load() {
    const data = await fetchWatchlists();
    setLists(data.results);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createWatchlist({ name, is_public: isPublic });
    setName("");
    setShowForm(false);
    load();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl tracking-wide text-paper">Listes</h1>
        {user && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm px-4 py-2 rounded-full bg-neon text-void font-semibold shadow-glow hover:brightness-110 transition focus-ring"
          >
            + Nouvelle liste
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 border border-white/10 rounded-lg p-4 bg-curtain/50 flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-smoke block mb-1">Nom de la liste</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-void border border-white/10 rounded-md px-3 py-2 text-sm text-paper focus-ring"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-paper/80 pb-2">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Publique
          </label>
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-marquee text-void text-sm font-semibold hover:brightness-110 transition focus-ring"
          >
            Créer
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/watchlists/${list.id}`}
            className="block border border-white/10 rounded-lg p-4 hover:border-marquee/40 transition-colors focus-ring"
          >
            <h3 className="font-display text-xl tracking-wide text-paper">{list.name}</h3>
            <p className="text-xs text-smoke mt-1">
              {list.movie_count} film{list.movie_count > 1 ? "s" : ""} · par {list.owner_username}
            </p>
          </Link>
        ))}
        {lists.length === 0 && <p className="text-smoke text-sm">Aucune liste pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
