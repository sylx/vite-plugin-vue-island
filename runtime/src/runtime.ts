import { App,RenderFunction } from "vue"

export type RenderInfo = {
    id: string, //island id
    filename: string, //source filename
    render: RenderFunction
}

export type AppFactory = (render: RenderFunction,renderInfo: RenderInfo) => App<Element>

const renderInfos = [] as RenderInfo[]

export function registerRender(render: RenderFunction,id: string,filename: string): void{
    console.log("register",render,id,filename)
    renderInfos.push({
        id,
        filename,
        render
    })
}

export function getRender(filters : {index?: number, id?: string, filename?: string}): RenderFunction | null {
    if (!filters) {
        return null;
    }    
    if(filters.index){
        return renderInfos[filters.index]?.render ?? null
    }
    const ret=renderInfos.filter(i=>{
        if(filters.id){
            return i.id === filters.id
        }
        if(filters.filename){
            return i.filename === filters.filename
        }
        return false
    })
    return ret.length > 0 ? ret[0].render : null
}

export function mountApp(appFactory: AppFactory): App<Element>[]{
    return renderInfos.map(info=>{
        console.log(info)
        const app=appFactory(info.render,info)
        app.mount(`[data-vue-island]`) //TODO: use id
        return app
    })
}
