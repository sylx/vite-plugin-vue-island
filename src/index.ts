import type { Plugin, TransformResult, ViteDevServer } from 'vite'
import { JSDOM } from "jsdom"
import { parse, compileTemplate, SFCTemplateCompileResults } from "vue/compiler-sfc"
import { SFCDescriptor, SFCTemplateCompileOptions } from 'vue/compiler-sfc'
export interface Options {
    selector: string,
}

export default function VueIslandPlugin(rawOptions: Options = {}): Plugin {
    return {
        name: 'vite:vue-island',
        transform(code, id, options?) {
            const [filename, rawQuery] = id.split(`?`, 2)
            const query = Object.fromEntries(new URLSearchParams(rawQuery))
            if (query['vue-island'] == null) return
            try {
                const dom = new JSDOM(code);
                const { document } = dom.window
                const nodes = Array.from(document.querySelectorAll("[data-vue-island]"))
                const results = nodes.map(n => transformNodeToCode(n, id, options, this))
                return {
                    code: joinResultsCode(results)
                }
            } catch (e: any) {
                this.error(e.message)
            }
        },
    }
}

function transformNodeToCode(node: Element, id: string, options: any, pluginContext: any) {
    const code = node.innerHTML
    const { descriptor } = parse(`<template>${code}</template`)
    const compilerOptions = resolveTemplateCompilerOptions(descriptor)
    const result = compileTemplate({
        ...compilerOptions,
        source: code
    } as SFCTemplateCompileOptions)
    return result
}

function joinResultsCode(results: SFCTemplateCompileResults[]) {
    const code = [
        `import * as Vue from "vue"`,
        `const renderCollection=[]`
    ]
    results.forEach(r =>{
        code.push(`renderCollection.push(function(){${r.code}})`)
    })
    code.push(`export default function getRender(){return renderCollection.map(r=>r())}`)
    return code.join("\n")
}

function resolveTemplateCompilerOptions(
    descriptor: SFCDescriptor,
    ssr?: boolean,
): Omit<SFCTemplateCompileOptions, 'source'> | undefined {
    const block = descriptor.template
    if (!block) {
        return
    }
    const { filename, cssVars } = descriptor

    const id = "hoge"
    return {
        id,
        filename,
        slotted: descriptor.slotted,
        isProd: false,
        inMap: block.src ? undefined : block.map,
        ssr,
        ssrCssVars: cssVars,
        transformAssetUrls: false,
        preprocessLang: block.lang,
        compilerOptions: {
            sourceMap: false,
            mode: "function"
        }
    }
}


