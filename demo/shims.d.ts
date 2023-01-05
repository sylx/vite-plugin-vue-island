declare module '*?vue-island' {
    export { AppFactory, RenderInfo, getRender, mountApp, registerRender } from 'vue-island'
}

declare module '*.vue' {
    import type { ComponentOptions } from 'vue'
    const component: ComponentOptions
    export default component
}
