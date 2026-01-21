import type { Config } from "tailwindcss";
import { colors } from './lib/styles/tokens/colors'

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        // NEW: Role-based semantic tokens
        brand: colors.brand,
        action: colors.action,
        status: colors.status,
        atmosphere: colors.atmosphere.violet,

        // Primary design system (top-level semantic tokens)
        bg: 'var(--bg)',
        background: colors.neutral.bg,
        surface: {
          DEFAULT: colors.neutral.surface,
          2: colors.neutral.surface2,
          3: colors.neutral.surface3,
        },
        text: 'var(--text)',
        foreground: colors.neutral.text,
        muted: colors.neutral.textMuted,
        subtle: colors.neutral.textSubtle,
        border: colors.neutral.border,

        // DEPRECATED: Map old accent to brand for backward compatibility
        accent: {
          DEFAULT: colors.brand.DEFAULT,
          hover: colors.brand.hover,
          active: colors.brand.active,
        },

        // Legacy tokens (compatibility)
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Prompt Toolkit semantic tokens (fallback)
        ptk: {
          bg: 'var(--ptk-bg)',
          surface: 'var(--ptk-surface)',
          surface2: 'var(--ptk-surface2)',
          text: 'var(--ptk-text)',
          muted: 'var(--ptk-muted)',
          border: 'var(--ptk-border)',
          accent: 'var(--ptk-accent)',
          'accent-hover': 'var(--ptk-accent-hover)',
          'accent-active': 'var(--ptk-accent-active)',
        },
        // Refined design tokens for vitality (legacy - renamed to avoid conflicts)
        bgold: {
          0: '#030305',
          1: '#07070B',
          2: '#0B0C12',
        },
        panel: {
          0: 'rgba(255,255,255,0.03)',
          1: 'rgba(255,255,255,0.05)',
          2: 'rgba(255,255,255,0.07)',
        },
        borderLevels: {
          0: 'rgba(255,255,255,0.08)',
          1: 'rgba(59,130,246,0.18)',
          2: 'rgba(139,92,246,0.18)',
        },
        textLevels: {
          0: 'rgba(255,255,255,0.92)',
          1: 'rgba(255,255,255,0.72)',
          2: 'rgba(255,255,255,0.52)',
        },
        accentLegacy: {
          blue: '#3B82F6',
          violet: '#8B5CF6',
          green: '#A3E635',
        },
        // Huly-inspired dark theme (preserved for compatibility)
        huly: {
          black: '#030305',
          darkgray: '#0A0B0D',
          gray: '#1A1B1E',
          lightgray: '#6B6C70',
          white: '#E5E5E7',
          accent: '#3B82F6',
          accentHover: '#2563EB',
        },
        // Spotify-inspired dark theme (preserved for library route)
        spotify: {
          black: "#121212",
          darkgray: "#181818",
          gray: "#282828",
          lightgray: "#B3B3B3",
          white: "#FFFFFF",
          green: "#1cd760",
          greenhover: "#2ae174",
        },
        // Meema brand colors
        meema: {
          indigo: {
            500: '#6366f1',
            600: '#4f46e5',
          },
          rose: {
            500: '#f43f5e',
            600: '#e11d48',
          },
          pink: {
            500: '#ec4899',
            600: '#db2777',
          },
          slate: {
            50: '#f8fafc',
            200: '#e2e8f0',
            300: '#cbd5e1',
            600: '#475569',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
        },
      },
      borderRadius: {
        'meema-card': '1rem',
        'meema-btn': '0.75rem',
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(ellipse at top, #0A0B0D 0%, #030305 100%)',
        'radial-accent': 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(0,0,0,0.5)',
        'card-hover': '0 12px 32px rgba(0,0,0,0.6)',
        'play': '0 8px 16px rgba(0,0,0,0.3)',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      rotate: {
        '60': '60deg',
        '70': '70deg',
      },
      brightness: {
        '130': '1.30',
        '140': '1.40',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
