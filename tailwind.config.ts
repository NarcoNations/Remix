import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        primary: "var(--primary)",
        panel: "var(--panel)",
        ring: "var(--ring)",
      },
      borderRadius: { xl: "1.25rem", "2xl": "1.5rem" },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,.06)",
      },
      fontFamily: {
        display: ['var(--font-display)', "system-ui", "sans-serif"],
        sans: ['var(--font-sans)', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
