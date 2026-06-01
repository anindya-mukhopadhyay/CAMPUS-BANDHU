import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Core surfaces */
        base: "rgb(var(--color-base) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",

        /* Accent spectrum */
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        electric: "rgb(var(--color-electric) / <alpha-value>)",
        purple: "rgb(var(--color-purple) / <alpha-value>)",
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        blaze: "rgb(var(--color-blaze) / <alpha-value>)",
        rose: "rgb(var(--color-rose) / <alpha-value>)",

        /* Text */
        slate: "rgb(var(--color-text-muted) / <alpha-value>)",
        subtle: "rgb(var(--color-text-subtle) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0, 0, 0, 0.45)",
        neon: "0 0 35px rgba(220, 38, 38, 0.25)",
        "neon-purple": "0 0 35px rgba(190, 24, 74, 0.25)",
        "neon-cyan": "0 0 35px rgba(148, 163, 184, 0.2)",
        "glow-sm": "0 0 15px rgba(220, 38, 38, 0.12)",
        "glow-md": "0 0 30px rgba(220, 38, 38, 0.18)",
        "glow-lg": "0 0 60px rgba(220, 38, 38, 0.22)",
        float: "0 30px 80px rgba(0, 0, 0, 0.55), 0 0 40px rgba(220, 38, 38, 0.03)"
      },
      backgroundImage: {
        "mesh-grid":
          "radial-gradient(circle at 15% 15%, rgba(220, 38, 38, 0.08), transparent 40%), radial-gradient(circle at 85% 5%, rgba(190, 24, 74, 0.06), transparent 45%), radial-gradient(circle at 50% 80%, rgba(153, 27, 27, 0.04), transparent 50%), linear-gradient(180deg, rgb(10, 10, 12) 0%, rgba(18, 18, 20, 0.5) 100%)",
        "gradient-radial": "radial-gradient(circle at center, var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "4xl": "2rem"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-down": "slide-down 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spin-slow": "spin-slow 12s linear infinite",
        holographic: "holographic 8s ease infinite",
        "border-glow": "border-glow 3s ease-in-out infinite"
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px"
      }
    }
  },
  plugins: []
};

export default config;
