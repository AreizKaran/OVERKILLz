/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#14213D', 50: '#F4F6FA', 700: '#1B2C4F', 900: '#0E1730' },
        brand: { DEFAULT: '#2563EB', 50: '#EFF6FF', 100: '#DBEAFE', 600: '#2563EB', 700: '#1D4ED8' },
        accent: { DEFAULT: '#F97316', 50: '#FFF7ED', 600: '#EA580C', 700: '#C2410C' },
        ok: { DEFAULT: '#10B981', 50: '#ECFDF5', 700: '#047857' },   // 700 for white text (5.5:1)
        warn: { DEFAULT: '#F59E0B', 50: '#FFFBEB', 700: '#B45309', 800: '#92400E' },
        bad: { DEFAULT: '#EF4444', 50: '#FEF2F2', 600: '#DC2626', 700: '#B91C1C' },
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        subtle: '#F1F5F9',
        ink: '#0F172A',
        muted: '#57637A',   // 5.5:1 on subtle, 6.0:1 on surface (was #64748B: 4.34:1 on subtle)
        line: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        lift: '0 6px 16px -4px rgba(15,23,42,.10), 0 2px 6px -2px rgba(15,23,42,.06)',
      },
      spacing: { 18: '4.5rem' },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: { 'fade-up': 'fade-up .32s ease-out both' },
    },
  },
  plugins: [],
}
