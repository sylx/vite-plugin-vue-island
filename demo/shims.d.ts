declare module '*?vue-island' {
    import type { RenderFunction } from 'vue'
    const getRender: (any) => RenderFunction
    export default getRender
}

declare module '*.vue' {
    import type { ComponentOptions } from 'vue'
    const component: ComponentOptions
    export default component
}
