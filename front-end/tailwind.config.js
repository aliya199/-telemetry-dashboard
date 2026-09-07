/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cream light-mode palette
        'app-bg':    '#F4E3B2', // Vanilla — page background
        'card-bg':   '#FFFFFF', // White — cards & modals
        'card-alt':  '#FDF8ED', // Light cream overlay — alternate card bg
        'ink':       '#310E10', // Black Bean — primary text, headings, icons
        'muted':     '#947268', // Cinereous — secondary text, borders, dividers
        'accent':    '#45462A', // Drab Dark Brown — warning badges, secondary accents
        'danger':    '#74070E', // Blood Red — CRITICAL badges & error text ONLY
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(49,14,16,0.08), 0 0 0 1px rgba(148,114,104,0.15)',
        modal: '0 8px 32px 0 rgba(49,14,16,0.18)',
      },
    },
  },
  plugins: [],
};
