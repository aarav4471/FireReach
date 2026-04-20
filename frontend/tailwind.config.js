/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc", // Gray 50
        surface: "#ffffff",    // White
        surfaceLight: "#f1f5f9", // Gray 100
        primary: "#000000",     // Black for primary actions
        primaryHover: "#1e293b", // Slate 800
        accent: "#3b82f6",      // Blue 500
        foreground: "#000000",  // Pure Black
        foregroundMuted: "#475569", // Slate 600
        border: "#e2e8f0"       // Gray 200
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
