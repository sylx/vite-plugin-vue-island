declare module '*.vue' {
    import { ComponentOptions } from "vue"
    const component: ComponentOptions
    export default component
}

declare module '*.html?vue-island' {
    import { App, RenderFunction } from "vue"
    export type AppFactory = (render: RenderFunction, renderInfo: { id: string, filename: string }) => App<Element>
    export function registerRender(render: RenderFunction, id: string, filename: string): void
    export function getRender(filters: { index?: number, id?: string, filename?: string }): RenderFunction | null
    export function mountApp(appFactory: AppFactory): App<Element>[]
}