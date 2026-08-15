import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0B0B10",
        curtain: "#15121C",
        marquee: "#E8B34D",
        neon: "#FF3D81",
        reel: "#2DD4BF",
        paper: "#F2EFEA",
        smoke: "#7A7688",
      },
      fontFamily: {
        display: ["var(--font-marquee)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px 2px rgba(255,61,129,0.35)",
        gold: "0 0 24px 2px rgba(232,179,77,0.30)",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 22%, 24%, 55%": { opacity: "0.55" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        flicker: "flicker 6s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
