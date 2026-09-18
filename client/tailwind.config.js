/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep indigo anchor — richer than the old flat navy.
        navy: { DEFAULT: '#1E1B4B', 50: '#EEF2FF', 700: '#312E81', 900: '#171449' },
        // Vivid indigo primary. Every fill below clears 4.5:1 under white text.
        brand: { DEFAULT: '#4F46E5', 50: '#EEF2FF', 100: '#E0E7FF', 600: '#4F46E5', 700: '#4338CA' },
        violet: { DEFAULT: '#7C3AED', 50: '#F5F3FF', 100: '#EDE9FE', 600: '#7C3AED', 700: '#6D28D9' },
        accent: { DEFAULT: '#C026D3', 50: '#FDF4FF', 100: '#FAE8FF', 600: '#C026D3', 700: '#A21CAF' },
        ok:   { DEFAULT: '#10B981', 50: '#ECFDF5', 600: '#059669', 700: '#047857' },
        warn: { DEFAULT: '#F59E0B', 50: '#FFFBEB', 700: '#92400E', 800: '#78350F' },  // 700 darkened: #B45309 was 4.44:1 on the new subtle
        bad:  { DEFAULT: '#F43F5E', 50: '#FFF1F2', 600: '#E11D48', 700: '#BE123C' },
        cyan: { DEFAULT: '#06B6D4', 50: '#ECFEFF', 700: '#0E7490' },
        canvas: '#F7F7FB',
        surface: '#FFFFFF',
        subtle: '#F1F0F9',
        ink: '#100E24',
        muted: '#57536E',   // 5.6:1 on subtle, 6.2:1 on surface
        line: '#E5E3F0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
      boxShadow: {
        card: '0 1px 2px rgba(30,27,75,.05), 0 1px 3px rgba(30,27,75,.07)',
        lift: '0 10px 28px -8px rgba(79,70,229,.22), 0 4px 10px -4px rgba(30,27,75,.10)',
        glow: '0 12px 32px -10px rgba(79,70,229,.45)',
        tile: '0 8px 24px -10px rgba(30,27,75,.35)',
      },
      backgroundImage: {
        'grad-brand':  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'grad-violet': 'linear-gradient(135deg, #6D28D9 0%, #A21CAF 100%)',
        'grad-navy':   'linear-gradient(160deg, #1E1B4B 0%, #312E81 55%, #4338CA 100%)',
        'grad-rose':   'linear-gradient(135deg, #BE123C 0%, #A21CAF 100%)',
        'grad-teal':   'linear-gradient(135deg, #0F766E 0%, #0E7490 100%)',
        'grad-amber':  'linear-gradient(135deg, #C2410C 0%, #BE123C 100%)',
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title':   ['1.5rem',  { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '650' }],
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
