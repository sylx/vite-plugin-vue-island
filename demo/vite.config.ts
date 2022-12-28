import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueIslandPlugin from '../dist/index.mjs'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  resolve: {
    alias: {
    },
  },
  plugins: [
    Inspect({
      build: true,
      outputDir: 'dist/.vite-inspect'
    }),
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
