import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      includePublic: true,
      logStats: true,
      jpeg: { quality: 82 },
      jpg: { quality: 82 },
      png: { quality: 80 },
    }),
  ],
  build: {
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});
