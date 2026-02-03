import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand colors based on the logo
        primary: {
          DEFAULT: "#4C1D95", // Purple from logo
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        // Text colors - Black based for readability
        textColor: {
          DEFAULT: "#000000",
          primary: "#000000",
          secondary: "#333333",
          muted: "#666666",
          light: "#999999",
        },
        // Metallic silver for luxury feel
        metallic: {
          DEFAULT: "#101010",
          50: "#F8F8F8",
          100: "#F0F0F0",
          200: "#E0E0E0",
          300: "#C0C0C0",
          400: "#A0A0A0",
          500: "#808080",
          600: "#606060",
          700: "#404040",
          800: "#202020",
          900: "#101010",
        },
        dark: {
          DEFAULT: "#0A0A0A",
          50: "#1A1A1A",
          100: "#2A2A2A",
          200: "#3A3A3A",
          300: "#4A4A4A",
          400: "#5A5A5A",
          500: "#6A6A6A",
          600: "#7A7A7A",
          700: "#8A8A8A",
          800: "#9A9A9A",
          900: "#AAAAAA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["SF Pro Display", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "bounce-subtle": "bounceSubtle 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        metallic:
          "linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #A0A0A0 100%)",
        "metallic-dark":
          "linear-gradient(135deg, #2A2A2A 0%, #404040 50%, #1A1A1A 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.3)",
        "glow-lg": "0 0 40px rgba(124, 58, 237, 0.4)",
        metallic:
          "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
