import { defineConfig } from 'vite';

// Relative asset URLs so the built folder can be copied to any path,
// including phantasyx.com/examples/spectrum-health/ or GitHub Pages.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
});
