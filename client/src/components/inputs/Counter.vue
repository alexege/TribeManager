<script setup>
import { ref, watch } from 'vue'
const emit = defineEmits(['update'])
const props = defineProps(['min', 'max', 'index', 'startCount'])
const count = ref(props.startCount || 0)
watch(
    () => props.startCount,
    (newValue) => {
        count.value = newValue
    }
)
const increment = () => {
    if (Number(props.max) && count.value < Number(props.max)) {
        count.value += 1
    }
    if (!props.max) {
        count.value += 1
    }
    emit('update', count.value, props.index)
}
const decrement = () => {
    if (count.value > (Number(props.min) || 0)) {
        count.value -= 1
        console.log('decrementing')
    }
    emit('update', count.value, props.index)
}
const handleInputChange = () => {
    emit('update', count.value, props.index)
}
</script>
<template>
    <div class="number-input">
        <input type="number" v-model="count" :min="props.min" :max="props.max" @input="handleInputChange" />
        <div class="number-controls">
            <button @click="increment()">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                    fill="#e8eaed">

                    <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />

                </svg>
            </button>
            <button @click="decrement()">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                    fill="#e8eaed">

                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />

                </svg>
            </button>
        </div>
    </div>
</template>
<style scoped>
/* Hide the spin buttons in WebKit browsers */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.number-input {
    margin: 2px;
}

.number-input button {
    background-color: rgba(255, 255, 255, 0.05);
    border: none;
    margin: 2px;
}

.number-input button:hover {
    cursor: pointer;
    outline: 1px solid white;
}

.number-input button:active {
    transform: translate(1px, 2px);
}

/* Hide spin buttons in Firefox */
input[type='number'] {
    -moz-appearance: textfield;
}

input[type='number'] {
    text-align: center;
    width: 100%;
    min-width: 10px;
    max-width: 3em;
    /* background-color: rgba(255, 255, 255, 0.025); */
    background-color: rgba(255, 255, 255, 0.205);
    color: white;
    border: none;
}

.number-controls {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.number-controls path {
    fill: white;
}
</style>
