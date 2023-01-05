import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueIslandPlugin from '../'
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
    minify: 'esbuild',
    target: "es2015",
    rollupOptions: {
      output: {
        format: 'iife'
      },
    },
  }
})
