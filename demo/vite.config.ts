import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueIslandPlugin from '../dist/index.mjs'

export default defineConfig({
  resolve: {
    alias: {
    },
  },
  plugins: [
    vuePlugin({
    }),
    vueIslandPlugin({

    }),
    splitVendorChunkPlugin(),
  ],
  build: {
    // to make tests faster
    minify: false,
    rollupOptions: {
      output: {
        // Test splitVendorChunkPlugin composition
        manualChunks(id) {
          if (id.includes('src-import')) {
            return 'src-import'
          }
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
})
