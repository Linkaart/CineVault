"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import FollowButton from "./FollowButton";

export default function ProfileActions({ userId }: { userId: number }) {
  const { user } = useAuth();

  if (user && user.id === userId) {
    return (
      <Link
        href="/settings/profile"
        className="inline-block px-5 py-2 rounded-full border border-marquee/40 text-marquee hover:bg-marquee/10 transition focus-ring"
      >
        Modifier mon profil
      </Link>
    );
  }

  return <FollowButton userId={userId} />;
}
