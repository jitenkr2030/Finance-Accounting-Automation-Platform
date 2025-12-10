/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EBF3FF',
          100: '#D6E7FF',
          200: '#A7CEFF',
          300: '#7FB6FF',
          400: '#569DFF',
          500: '#4A89F7',
          600: '#3A73E6',
          700: '#3569C7',
          800: '#2D5AA8',
          900: '#1E3A75',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F8F9FA',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#A0AEC0',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          700: '#B91C1C',
        },
        blue: {
          50: '#EFF6FF',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        purple: {
          50: '#FAF5FF',
        },
        pink: {
          50: '#FDF2F8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'xxxl': '64px',
      },
      borderRadius: {
        'DEFAULT': '12px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(74, 137, 247, 0.12)',
      },
    },
  },
  plugins: [],
}