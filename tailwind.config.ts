import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        }
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-sora)", "sans-serif"]
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.24), transparent 45%), radial-gradient(circle at 80% 0%, rgba(16, 185, 129, 0.18), transparent 35%)"
      },
      boxShadow: {
        glass: "0 12px 40px rgba(16, 24, 40, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
