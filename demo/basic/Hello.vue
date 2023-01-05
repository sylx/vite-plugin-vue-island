<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    msg: {
        type: String,
        default: 'Hello World'
    }
})
</script>

<template>
    <h3 class="hello">
        {{ props.msg }}
    </h3>
</template>