import * as Vue from "vue"
import { mountApp } from "./index.html?vue-island"
import Hello from "./Hello.vue"
const { createApp } = Vue

mountApp((render, renderInfo) => {
    return createApp({
        components: {
            Hello
        },
        render
    })
})
