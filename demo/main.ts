import * as Vue from "vue"
import getRender from "./index.html?vue-island"
import Hello from "./Hello.vue"
const {createApp}=Vue


const render=getRender(Vue)[0]

console.log(render)
console.log(Hello)

createApp({
    components: {
        Hello
    },
    render
}).mount(document.querySelector("[data-vue-island]"))