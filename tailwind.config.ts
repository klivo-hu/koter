import type { Config } from 'tailwindcss';

/**
 * Tailwind is wired to the CSS custom properties in app/globals.css rather than
 * carrying its own palette, so the design system has exactly one source of truth.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--cef-background)',
        surface: 'var(--cef-surface)',
        'surface-raised': 'var(--cef-surface-raised)',
        foreground: 'var(--cef-foreground)',
        muted: 'var(--cef-muted)',
        primary: 'var(--cef-primary)',
        'primary-foreground': 'var(--cef-primary-foreground)',
        border: 'var(--cef-border)',
        danger: 'var(--cef-danger)',
        success: 'var(--cef-success)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        measure: 'var(--k-measure)',
      },
    },
  },
  plugins: [],
};

export default config;
