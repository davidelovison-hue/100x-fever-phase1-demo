import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: https://davidelovison-hue.github.io/100x-fever-phase1-demo/
export default defineConfig({
  base: '/100x-fever-phase1-demo/',
  plugins: [react()],
  server: {
    host: true,
    port: 5177,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5177,
    strictPort: true,
  },
});
