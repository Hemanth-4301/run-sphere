/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Pure black & white theme with subtle transparencies handled via utilities
        accent: { DEFAULT: "#000000" },
        bg: { light: "#ffffff", dark: "#000000" },
        card: { light: "#ffffff", dark: "#0a0a0a" },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"Fira Code"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        soft: "0 1px 0 rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};
