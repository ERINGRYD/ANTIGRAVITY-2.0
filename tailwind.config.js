/** @type {import('tailwindcss').Config} */
export default {
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
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
}

