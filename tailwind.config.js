export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        gaming: ['Orbitron', 'Rajdhani', 'Arial', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 32px rgba(56, 189, 248, 0.45)',
        orangeGlow: '0 0 28px rgba(249, 115, 22, 0.35)'
      }
    }
  },
  plugins: []
};
