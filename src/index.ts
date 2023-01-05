import type { Plugin } from 'vite'
import { parse, compileTemplate } from "vue/compiler-sfc"
import { SFCDescriptor, SFCTemplateCompileOptions } from 'vue/compiler-sfc'
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { SAXParser, StartTag, EndTag, Comment } from "/Users/angel.yagura/project/vite-plugin-vue-island/node_modules/parse5-sax-parser/dist/index.js"

type PageEntry = {
    [key: string]: string
}

/**
 * Islandの検索条件
 * @param type 検索対象のタイプ
 * @param search 検索対象の文字列
 * @param regex 検索対象の正規表現
 * @example
 * {type: "attribute",search: "data-vue-island"}
 * @example
 * {type: "tag",search: "div"}
 * @example
 * {type: "comment",search: "vue-island"}
 * {type: "comment",regex: /vue-island/}
 **/
type IslandPredicate = {
    type: "attribute" | "tag" | "comment",
    search: string,
    regex?: RegExp
}

export interface Options {
    pages?: PageEntry,
    predicate?: IslandPredicate
}

const virtualRuntimeModuleId = 'virtual:vue-island-runtime'

export default function VueIslandPlugin(rawOptions: Options = {}): Plugin {
    const resolvedRuntimeVirtualModuleId = '\0' + virtualRuntimeModuleId
    return {
        name: 'vite:vue-island',
        resolveId(id) {
            if (id === virtualRuntimeModuleId) {
                return resolvedRuntimeVirtualModuleId
            }
            return null
        },
        load(id) {
            if (id === virtualRuntimeModuleId) {
                console.log("come")
                //return fs.readFileSync(__dirname + "/../runtime/dist/runtime.mjs", "utf-8")
            }
            return null
        },
        transform(code, id, options?) {
            const [filename, rawQuery] = id.split(`?`, 2)
            console.log(filename, rawQuery)
            const query = Object.fromEntries(new URLSearchParams(rawQuery))
            if (query['vue-island'] == null) return
            const predicate = rawOptions.predicate ?? { type: "attribute", search: "data-vue-island" }
            const results = extractIsland(code, predicate).map(({ html, startOffset, endOffset }) => transformHtmlToCode(html, "hoge", {}, this))
            return {
                code: joinResultsCode(results)
            }
        },
    }
}

function extractIsland(html: string, predicate: IslandPredicate) {
    const parser = new SAXParser({
        sourceCodeLocationInfo: true
    })
    const stack: string[] = []
    const htmls: {
        html: string,
        startOffset: number,
        endOffset: number
    }[] = []
    let openOffset: number | null = null

    function fnStartTag(cond: (args: StartTag) => boolean) {
        return function ({ tagName, attrs, selfClosing, sourceCodeLocation }: StartTag) {
            if (!sourceCodeLocation) throw new Error("invalid sax parser")
            if (!openOffset) {
                if (cond({ tagName, attrs, selfClosing })) {
                    openOffset = sourceCodeLocation.endOffset
                }
            } else if (!selfClosing) {
                stack.push(tagName)
            }
        }
    }
    function fnEndTag(cond: (args: EndTag) => boolean) {
        return function ({ tagName, sourceCodeLocation }: EndTag) {
            if (!sourceCodeLocation) throw new Error("invalid sax parser")
            if (openOffset) {
                if (cond({ tagName })) {
                    htmls.push({
                        html: html.substring(openOffset, sourceCodeLocation.startOffset),
                        startOffset: openOffset,
                        endOffset: sourceCodeLocation.startOffset
                    })
                    openOffset = null
                } else if (stack.length > 0) {
                    stack.pop()
                }
            }
        }
    }

    switch (predicate.type) {
        case "attribute":
            parser.on("startTag", fnStartTag(({ tagName, attrs }: StartTag) => attrs.filter(attr => attr.name === predicate.search).length > 0))
            parser.on("endTag", fnEndTag(({ tagName }: EndTag) => stack.length === 0))
            break
        case "tag":
            parser.on("startTag", fnStartTag(({ tagName, attrs }: StartTag) => tagName === predicate.search))
            parser.on("endTag", fnEndTag(({ tagName }: EndTag) => stack.length === 0))
            break
        case "comment":
            parser.on("comment", ({ text, sourceCodeLocation }: Comment) => {
                if (!sourceCodeLocation) throw new Error("invalid sax parser")
                const normalizedText = text.trim()
                if ((predicate.regex && normalizedText.match(predicate.regex)) || normalizedText === predicate.search) {
                    if (!openOffset) {
                        openOffset = sourceCodeLocation.endOffset
                    } else {
                        htmls.push({
                            html: html.substring(openOffset, sourceCodeLocation.startOffset),
                            startOffset: openOffset,
                            endOffset: sourceCodeLocation.startOffset
                        })
                        openOffset = null
                    }
                }
            })
            break
    }
    parser.write(html, "utf-8")
    return htmls
}

function transformHtmlToCode(html: string, id: string, options: any, pluginContext: any) {
    const { descriptor } = parse(`<template>${html}</template`)
    const compilerOptions = resolveTemplateCompilerOptions(descriptor)
    const result = compileTemplate({
        ...compilerOptions,
        id,
        source: html
    } as SFCTemplateCompileOptions)
    return result
}

function joinResultsCode(results: any[]) {
    const code = [
        `import * as Vue from "vue"`,
        `/*** runtime ***/`,
        readFileSync(resolve(__dirname, "../runtime/dist/runtime.mjs"), "utf-8"), //expand inline!!!
        `/*** runtime ***/`,
    ]
    const id = "hoge"
    const filename = "hoge.html"
    results.forEach((r, index) => {
        code.push(`/* register render at ${index} from ${filename} #${id} */`)
        code.push(`registerRender((function(){${r.code}})(),"${id}","${filename}")`)
    })
    return code.join("\n")
}

function resolveTemplateCompilerOptions(
    descriptor: SFCDescriptor,
    ssr?: boolean,
): Omit<SFCTemplateCompileOptions, 'source' | 'id'> | undefined {
    const block = descriptor.template
    if (!block) {
        return
    }
    const { filename, cssVars } = descriptor

    return {
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


