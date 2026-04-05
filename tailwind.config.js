/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1978e5",
        "background-light": "#f6f7f8",
        "background-dark": "#111821",
        "conteudo": "#3b82f6",
        "interpretacao": "#8b5cf6",
        "distracao": "#f97316",
        "secondary": "#10B981",
        "tertiary": "#0EA5E9",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "game-green": "#10B981",
        "game-blue": "#3B82F6",
        "game-red": "#EF4444",
        "game-purple": "#8B5CF6",
        "game-gold": "#F59E0B",
      },
      boxShadow: {
        'glow': '0 0 15px rgba(16, 185, 129, 0.4)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'epic': '0 4px 0px 0px #047857',
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      animation: {
        "pulse-soft": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
}

