"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue || "");
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/movies?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Chercher un film..."
        className="flex-1 bg-curtain border border-white/10 rounded-full px-4 py-2 text-sm text-paper placeholder:text-smoke focus-ring"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-full bg-marquee text-void text-sm font-semibold hover:brightness-110 transition focus-ring"
      >
        Chercher
      </button>
    </form>
  );
}
