import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B",
        mist: "#E8E4DA",
        ember: "#FF6B35",
        moss: "#2E6F65",
        sky: "#B5E2FA"
      }
    }
  },
  plugins: []
};

export default config;
