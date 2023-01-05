declare module '*?vue-island' {
    import type { RenderFunction } from 'vue'
}

declare module '*.vue' {
    import type { ComponentOptions } from 'vue'
    const component: ComponentOptions
    export default component
}
