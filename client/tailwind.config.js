/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Soft pastel palette
        pastel: {
          pink: '#fce7f3',
          purple: '#ede9fe',
          peach: '#fff3e6',
          rose: '#fdf2f8',
          lavender: '#f5f3ff',
        },
        brand: {
          purple: '#8b5cf6',
          violet: '#7c3aed',
          pink: '#ec4899',
          rose: '#f43f5e',
          peach: '#fb923c',
        },
      },
      backgroundImage: {
        'grad-hero': 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #fff3e6 100%)',
        'grad-card': 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)',
        'grad-primary': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        'grad-warm': 'linear-gradient(135deg, #f97316, #ec4899)',
        'grad-cool': 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        'grad-success': 'linear-gradient(135deg, #34d399, #059669)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(139, 92, 246, 0.12)',
        'glass-lg': '0 20px 60px rgba(139, 92, 246, 0.18)',
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 40px rgba(139, 92, 246, 0.2)',
        'btn': '0 4px 15px rgba(139, 92, 246, 0.4)',
        'btn-pink': '0 4px 15px rgba(236, 72, 153, 0.4)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-mid': 'float 4s ease-in-out infinite reverse',
        'float-fast': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'confetti': 'confetti 1.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(-200px) rotate(720deg)', opacity: 0 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
