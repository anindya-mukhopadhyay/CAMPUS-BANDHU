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
        soft: "0 20px 60px rgba(0, 0, 0, 0.85)",
        neon: "0 0 0 1px rgba(255, 255, 255, 0.2)",
        "neon-purple": "0 0 0 1px rgba(255, 255, 255, 0.15)",
        "neon-cyan": "0 0 0 1px rgba(255, 255, 255, 0.12)",
        "glow-sm": "0 0 0 1px rgba(255, 255, 255, 0.08)",
        "glow-md": "0 0 0 1px rgba(255, 255, 255, 0.15)",
        "glow-lg": "0 0 0 1px rgba(255, 255, 255, 0.2)",
        float: "0 30px 80px rgba(0, 0, 0, 0.85)"
      },
      backgroundImage: {
        "mesh-grid":
          "linear-gradient(180deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)",
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
