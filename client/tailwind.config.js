/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Ink on paper. The register this replaces was printed, and the palette
           says so: warm stock, dark ink, one institutional seal colour, and
           status hues used ONLY where they encode state. */
        ink:     { DEFAULT: '#1A1714', 700: '#2E2922', 500: '#5A5248' },
        paper:   '#FAF8F5',
        surface: '#FFFFFF',
        subtle:  '#F2EFE9',
        muted:   '#5A5248',
        line:    '#E3DDD2',
        rule:    '#D4CCBD',

        /* The institutional seal. Swap for SMIT's official hex — it is one token. */
        seal: { DEFAULT: '#9E1B32', 700: '#8C1729', 900: '#7A1524', 50: '#FBF0F1', 100: '#F6E0E3' },

        /* Status. These are the only other colours in the product. */
        ok:   { DEFAULT: '#1F6B4A', 50: '#EDF6F1', 700: '#1A5A3E' },
        warn: { DEFAULT: '#8A5A12', 50: '#FAF3E6', 700: '#754B0C', 800: '#5E3C08' },
        bad:  { DEFAULT: '#A3241C', 50: '#FBEFEE', 600: '#8F1F18', 700: '#7C1B15' },

        /* Legacy aliases so existing class names keep resolving. */
        navy:   { DEFAULT: '#1A1714', 50: '#F2EFE9', 700: '#2E2922', 900: '#100E0C' },
        brand:  { DEFAULT: '#9E1B32', 50: '#FBF0F1', 100: '#F6E0E3', 600: '#9E1B32', 700: '#8C1729' },
        accent: { DEFAULT: '#8A5A12', 50: '#FAF3E6', 600: '#754B0C', 700: '#5E3C08' },
        violet: { DEFAULT: '#7A1524', 50: '#FBF0F1', 100: '#F6E0E3', 600: '#8C1729', 700: '#7A1524' },
        cyan:   { DEFAULT: '#1F6B4A', 50: '#EDF6F1', 700: '#1A5A3E' },
        canvas: '#FAF8F5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
      boxShadow: {
        card: '0 1px 1px rgba(26,23,20,.04)',
        lift: '0 4px 14px -6px rgba(26,23,20,.14), 0 1px 3px rgba(26,23,20,.06)',
        glow: '0 2px 6px -2px rgba(158,27,50,.35)',
        tile: '0 1px 1px rgba(26,23,20,.04)',
      },
      backgroundImage: {
        /* Flat fills. Kept as names so components need no rewrite. */
        'grad-brand':  'linear-gradient(180deg, #9E1B32 0%, #8C1729 100%)',
        'grad-violet': 'linear-gradient(180deg, #2E2922 0%, #1A1714 100%)',
        'grad-navy':   'linear-gradient(180deg, #211D19 0%, #15120F 100%)',
        'grad-rose':   'linear-gradient(180deg, #9E1B32 0%, #7A1524 100%)',
        'grad-teal':   'linear-gradient(180deg, #1F6B4A 0%, #1A5A3E 100%)',
        'grad-amber':  'linear-gradient(180deg, #8A5A12 0%, #754B0C 100%)',
        /* Ruled paper, for the sign-in panel. */
        'ruled': 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,.055) 31px, rgba(255,255,255,.055) 32px)',
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
