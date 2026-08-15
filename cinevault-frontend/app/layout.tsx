import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import MarqueeTicker from "@/components/layout/MarqueeTicker";

const marquee = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marquee",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CineVault — Critiques & recommandations de films",
  description:
    "Note, critique et découvre des films. Des recommandations qui s'affinent à chaque avis que tu publies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${marquee.variable} ${body.variable}`}>
      <body className="font-body min-h-screen flex flex-col">
        <AuthProvider>
          <MarqueeTicker />
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 py-8 text-center text-sm text-smoke">
            CineVault — projet portfolio, données films via TMDB.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
