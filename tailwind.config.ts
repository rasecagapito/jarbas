import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jarbas: {
          bg: "#070d1f",
          surface: "#0c1324",
          panel: "#151b2d",
          cyan: "#00dbe9",
          blue: "#bbc3ff",
          text: "#dce1fb",
          muted: "#849495",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
