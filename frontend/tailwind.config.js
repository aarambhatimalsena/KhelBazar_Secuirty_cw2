// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Inter font support
      },
      colors: {
        // Optional: define brand colors
        primary: {
          DEFAULT: '#1e3a8a', // Tailwind's blue-900
          light: '#3b82f6',   // Tailwind's blue-500
          dark: '#1e40af',    // Tailwind's blue-800
        },
        gray: {
          light: '#f9fafb',
          DEFAULT: '#6b7280',
          dark: '#374151',
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
        medium: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
