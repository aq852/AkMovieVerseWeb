/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e17",
        surface: "#111827",
        "surface-card": "#161f30",
        brand: {
          blue: "#38bdf8",
          indigo: "#6366f1",
          red: "#ef4444"
        }
      }
    },
  },
  plugins: [],
};
