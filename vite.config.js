import { defineConfig } from 'vite';

// Relative asset URLs so dist/ can be copied to any folder,
// including phantasyx.com/examples/first-look/ or GitHub Pages.
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
