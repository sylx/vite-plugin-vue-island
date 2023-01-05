import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/runtime'],
  externals: ['vite', 'vue'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: false,
    inlineDependencies: true,
  },
})
