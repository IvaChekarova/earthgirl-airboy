import { defineConfig } from 'vite';

// Vite configuration for the Earthgirl & Airboy game.
// - `base: './'` makes the production build work from any sub-path.
// - The dev server opens automatically on `npm run dev`.
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000
  }
});
