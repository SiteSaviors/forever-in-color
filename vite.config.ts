import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { componentTagger } from 'lovable-tagger';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 4175,
  },
  plugins: [
    react(),
    ...(mode === 'development' ? [componentTagger()] : []),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/stats.html',
            template: 'treemap',
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('react-dom') || id.includes('react/jsx-runtime')) {
            return 'react-vendors';
          }

          if (id.includes('react-router-dom')) {
            return 'router-vendors';
          }

          if (id.includes('framer-motion')) {
            return 'motion-vendors';
          }

          if (id.includes('@radix-ui')) {
            return 'radix-vendors';
          }

          if (id.includes('zustand')) {
            return 'state-vendors';
          }

          if (id.includes('@tanstack/react-query')) {
            return 'query-vendors';
          }

          return undefined;
        },
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
  },
}));
