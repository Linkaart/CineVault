"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/movies", label: "Catalogue" },
  { href: "/recommendations", label: "Pour toi" },
  { href: "/feed", label: "Fil" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-void/80 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-display text-2xl tracking-wider text-marquee text-glow-gold focus-ring"
        >
          CINE<span className="text-neon text-glow-neon">VAULT</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-colors focus-ring ${
                pathname?.startsWith(link.href)
                  ? "text-marquee"
                  : "text-paper/70 hover:text-paper"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={`/users/${user.id}`}
                className="text-sm text-paper/80 hover:text-marquee transition-colors focus-ring"
              >
                {user.username}
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="text-sm text-smoke hover:text-neon transition-colors focus-ring"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-paper/80 hover:text-marquee transition-colors focus-ring"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-1.5 rounded-full bg-neon text-void font-semibold shadow-glow hover:brightness-110 transition focus-ring"
              >
                Rejoindre
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
