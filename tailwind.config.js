/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#C89A3D",
          light: "#DFBA6B",
          dark: "#A37B2E",
          hover: "#B68B35"
        },
        bg: {
          DEFAULT: "#F9F5EE",
          card: "rgba(255, 255, 255, 0.85)"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 12px 30px rgba(0, 0, 0, 0.04)",
        glassmorphic: "0 8px 32px 0 rgba(200, 154, 61, 0.05)"
      }
    },
  },
  plugins: [],
}
