"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api/client";

export default function FollowButton({ userId }: { userId: number }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user || user.id === userId) return null;

  async function toggle() {
    setBusy(true);
    try {
      const res = await apiFetch<{ following: boolean }>(`/users/${userId}/follow/`, {
        method: "POST",
      });
      setFollowing(res.following);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="px-5 py-2 rounded-full bg-neon text-void text-sm font-semibold shadow-glow hover:brightness-110 transition disabled:opacity-50 focus-ring"
    >
      {following === null ? "Suivre" : following ? "Suivi ✓" : "Suivre"}
    </button>
  );
}
