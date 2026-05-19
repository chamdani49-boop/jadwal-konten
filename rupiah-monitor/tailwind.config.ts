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
        bg: {
          DEFAULT: "#07090F",
          900: "#0B0E17",
          800: "#11151F",
          700: "#181D2A",
          600: "#222838",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.12)",
        },
        ink: {
          100: "#F4F7FB",
          200: "#D7DEEA",
          300: "#A3AFC5",
          400: "#6E7B95",
          500: "#3F4B66",
        },
        accent: {
          green: "#22C55E",
          red: "#EF4444",
          gold: "#F2A007",
          blue: "#3B82F6",
          purple: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.3)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        fadeUp: "fadeUp .35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
