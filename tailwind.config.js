/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        muse: {
          bg: "#f5f5f7",
          surface: "#ffffff",
          bubble: "#f0f0f2",
          user: "#c4b5fd",
          userText: "#1f1135",
          border: "#e8e8ec",
          muted: "#8e8e93",
          text: "#1c1c1e",
          accent: "#7c6af7",
          accentSoft: "#ede9fe",
          connected: "#34c759",
          rail: "#fafafa",
        },
      },
      fontFamily: {
        sans: [
          "SF Pro Text",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        panel: "0 0 0 1px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        bubble: "18px",
        panel: "20px",
      },
    },
  },
  plugins: [],
};
