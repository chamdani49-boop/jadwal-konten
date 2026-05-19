import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Neutral dark scale — Linear/Vercel-inspired
        bg: {
          DEFAULT: "#08090A",
          950: "#08090A",
          900: "#0E0F11",
          850: "#131517",
          800: "#191B1F",
          700: "#22252B",
          600: "#2C3038",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.07)",
          strong: "rgba(255,255,255,0.12)",
          hover: "rgba(255,255,255,0.18)",
        },
        // Foreground / text scale
        fg: {
          DEFAULT: "#EDEEF0",
          muted: "#9BA1AC",
          subtle: "#6E7480",
          dim: "#4B5060",
        },
        // Financial semantic — calmer than Tailwind defaults
        up: { DEFAULT: "#3FCF8E", soft: "rgba(63,207,142,.12)" },
        down: { DEFAULT: "#FF5C5C", soft: "rgba(255,92,92,.12)" },
        // Subtle accents (used very sparingly)
        gold: { DEFAULT: "#E6B056", soft: "rgba(230,176,86,.10)" },
        violet: { DEFAULT: "#A78BFA", soft: "rgba(167,139,250,.10)" },
      },
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Geist Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Editorial-scale type
        "display-1": ["clamp(4rem, 13vw, 9rem)", { lineHeight: "0.92", letterSpacing: "-0.04em", fontWeight: "500" }],
        "display-2": ["clamp(2.5rem, 7vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "500" }],
        "eyebrow": ["10px", { lineHeight: "1", letterSpacing: "0.18em", fontWeight: "600" }],
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(1.4)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        fadeUp: "fadeUp .35s ease-out both",
        marquee: "marquee 60s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
