import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'laptop': '1366px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#2b8aff",
          "primary-content": "#ffffff",
          "primary-focus": "#3b82f6",
          "secondary": "#93c5fd",
          "accent": "#dbeafe",
          "base-100": "#f8fafc",
          "base-200": "#f1f5f9",
          "base-300": "#e2e8f0",
          "base-content": "#1e293b",
        },
      },
      {
        dark: {
          "primary": "#e67b10",
          "primary-content": "#ffffff",
          "secondary": "#E65100",
          "secondary-content": "#ffffff",
          "accent": "#F57C00",
          "accent-content": "#ffffff",
          "neutral": "#141C2F",
          "neutral-content": "#ffffff",
          "base-100": "#0B1220",
          "base-200": "#141C2F",
          "base-300": "#1A2332",
          "base-content": "#ffffff",
          "info": "#00b3f0",
          "info-content": "#ffffff",
          "success": "#00ca92",
          "success-content": "#ffffff",
          "warning": "#ffbe00",
          "warning-content": "#ffffff",
          "error": "#ff5861",
          "error-content": "#ffffff",
        },
      },
    ],
  },
};
