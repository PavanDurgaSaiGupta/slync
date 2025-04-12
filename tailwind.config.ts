
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Matrix theme colors
				matrix: {
					primary: 'var(--theme-primary, #00FF44)',
					secondary: 'var(--theme-secondary, #0D7377)',
					background: '#0A0E0E',
					accent: '#05FF00',
					muted: '#323232',
				},
				// Theme variants - simplified to 5 core themes
				theme: {
					'1': { primary: '#00FF44', secondary: '#0D7377' }, // Matrix default
					'2': { primary: '#5D80FE', secondary: '#1D3057' }, // Neo Blue
					'3': { primary: '#FF71C5', secondary: '#8C4573' }, // Cyber Pink
					'4': { primary: '#ECDB54', secondary: '#8C7A28' }, // Amber Gold
					'5': { primary: '#9B87F5', secondary: '#433A68' }, // Purple Neon
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'matrix-rain': {
					'0%': { transform: 'translateY(-100vh)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '0.8' },
					'100%': { transform: 'translateY(100vh)', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'zoom-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'flicker': {
					'0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '1' },
					'20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 5px 2px rgba(var(--theme-primary-rgb), 0.7)' },
					'50%': { boxShadow: '0 0 15px 5px rgba(var(--theme-primary-rgb), 0.9)' }
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},
				'matrix-shine': {
					'0%': { transform: 'translate(-50%, -50%) rotate(45deg)' },
					'100%': { transform: 'translate(50%, 50%) rotate(45deg)' }
				},
				'matrix-sweep': {
					'0%': { left: '-100%' },
					'100%': { left: '100%' }
				},
				'pulse-background': {
					'0%': { opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'matrix-rain': 'matrix-rain 6s linear infinite',
				'slower-matrix-rain': 'matrix-rain 10s linear infinite',
				'faster-matrix-rain': 'matrix-rain 3s linear infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'zoom-in': 'zoom-in 0.3s ease-out',
				'flicker': 'flicker 2s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'blink': 'blink 1s step-start infinite',
				'matrix-shine': 'matrix-shine 1.5s infinite',
				'matrix-sweep': 'matrix-sweep 0.7s forwards',
				'pulse-background': 'pulse-background 2s forwards'
			},
			boxShadow: {
				'glow-sm': '0 0 5px 2px rgba(var(--theme-primary-rgb, 0, 255, 68), 0.3)',
				'glow': '0 0 10px 3px rgba(var(--theme-primary-rgb, 0, 255, 68), 0.5)',
				'glow-lg': '0 0 15px 5px rgba(var(--theme-primary-rgb, 0, 255, 68), 0.7)',
			},
			fontFamily: {
				'matrix': ['VT323', 'monospace', 'ui-monospace', 'SFMono-Regular'],
				'mono': ['JetBrains Mono', 'monospace']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
