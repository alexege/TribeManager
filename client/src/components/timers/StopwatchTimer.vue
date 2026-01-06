<script setup>
import { ref } from 'vue'


const props = defineProps({ timer: Object })


const elapsed = ref(props.timer.elapsed || 0)
let id


const start = () => {
if (props.timer.isActive) return
props.timer.isActive = true
const startTime = Date.now() - elapsed.value


const tick = () => {
if (!props.timer.isActive) return
elapsed.value = Date.now() - startTime
id = requestAnimationFrame(tick)
}
tick()
}


const stop = () => {
props.timer.isActive = false
cancelAnimationFrame(id)
}


const reset = () => elapsed.value = 0


const format = ms => new Date(ms).toISOString().substring(11, 19)
</script>


<template>
<div class="stopwatch">
<div>{{ format(elapsed) }}</div>
<div class="controls">
    <button @click="start">▶</button>
    <button @click="stop">⏸</button>
    <button @click="reset">⟲</button>
</div>
</div>
</template>
<style scoped>
    .stopwatch {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        border-radius: 6px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-style: solid;
        border-color: white;
        border-width: 0 1px 1px 1px;
    }
</style>