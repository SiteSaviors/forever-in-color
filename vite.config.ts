
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Advanced code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-aspect-ratio', '@radix-ui/react-toast'],
          'utils-vendor': ['@tanstack/react-query', 'lucide-react'],
          
          // Feature-based chunks
          'photo-editing': [
            'src/components/product/PhotoCropper.tsx',
            'src/components/product/photo-upload/PhotoUploadContainer.tsx',
            'src/utils/imageCompression.ts'
          ],
          'style-preview': [
            'src/components/product/StyleCard.tsx',
            'src/components/product/StyleGrid.tsx',
            'src/components/product/MockupCanvas.tsx'
          ],
          'payment': [
            'src/components/product/PaymentForm.tsx',
            'src/components/product/OrderSummary.tsx'
          ]
        },
        // Optimize chunk loading
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('vendor')) {
            return 'assets/vendor/[name]-[hash].js';
          }
          return 'assets/chunks/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/css/i.test(extType || '')) {
            return 'assets/styles/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Enable source maps in production for better debugging
    sourcemap: mode === 'production' ? 'hidden' : true,
    // Optimize for modern browsers
    target: 'es2020',
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log'] : []
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Asset size warnings
    chunkSizeWarningLimit: 500
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ],
    exclude: [
      // Large dependencies that benefit from code splitting
      '@radix-ui/react-dialog',
      'react-easy-crop'
    ]
  },
  // Enable aggressive caching
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __ENABLE_SW__: JSON.stringify(mode === 'production')
  }
}));
