
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timer.store'
import InlineEdit from '@/components/inputs/InlineEdit.vue'
const props = defineProps(['timer', 'widgetId', 'widgetImage', 'widgetName'])
const emit = defineEmits(['image-click'])
const timerStore = useTimerStore()
const time = ref('00:00:00:00')
const intervalId = ref(null)
onMounted(() => {
    updateDisplay()
    if (props.timer.isActive) startInterval()
})
onUnmounted(() => {
    if (intervalId.value) clearInterval(intervalId.value)
})
watch(() => props.timer, () => {
    updateDisplay()
    if (props.timer.isActive && !intervalId.value) {
        startInterval()
    } else if (!props.timer.isActive && intervalId.value) {
        clearInterval(intervalId.value)
        intervalId.value = null
    }
}, { deep: true })
function start() {
    if (props.timer.isActive) return
    if (!props.timer.timeBegan) {
        timerStore.updateTimer(props.widgetId, {
            timeBegan: Date.now(),
            stoppedDuration: 0,
            isActive: true
        })
    } else {
        const pauseDuration = Date.now() - (props.timer.timeStopped || Date.now())
        timerStore.updateTimer(props.widgetId, {
            stoppedDuration: (props.timer.stoppedDuration || 0) + pauseDuration,
            isActive: true,
            timeStopped: null
        })
    }
    startInterval()
}
function startInterval() {
    intervalId.value = setInterval(() => {
        updateDisplay()
    }, 10)
}
function stop() {
    if (!props.timer.isActive) return
    timerStore.updateTimer(props.widgetId, {
        isActive: false,
        timeStopped: Date.now()
    })
    if (intervalId.value) {
        clearInterval(intervalId.value)
        intervalId.value = null
    }
}
function reset() {
    if (intervalId.value) {
        clearInterval(intervalId.value)
        intervalId.value = null
    }
    timerStore.updateTimer(props.widgetId, {
        isActive: false,
        timeBegan: null,
        timeStopped: null,
        stoppedDuration: 0
    })
    time.value = "00:00:00:00"
}
function updateDisplay() {
    if (!props.timer.timeBegan) {
        time.value = "00:00:00:00"
        return
    }
    const currentTime = Date.now()
    const elapsed = currentTime - props.timer.timeBegan - (props.timer.stoppedDuration || 0)
    const ms = Math.floor((elapsed % 1000) / 10)
    const sec = Math.floor((elapsed / 1000) % 60)
    const min = Math.floor((elapsed / (1000 * 60)) % 60)
    const hour = Math.floor(elapsed / (1000 * 60 * 60))
    time.value = `${zeroPrefix(hour, 2)}:${zeroPrefix(min, 2)}:${zeroPrefix(sec, 2)}:${zeroPrefix(ms, 2)}`
}
function zeroPrefix(num, digit) {
    return String(num).padStart(digit, '0')
}
const timerFromStore = computed(() => timerStore.getTimerById(props.widgetId))
const timerName = computed(() => timerFromStore.value?.name || props.widgetName || 'Stopwatch')
const onSaveName = (val) => timerStore.updateWidgetName(props.widgetId, val)
// Visual logic to match Countdown color scheme
const stopwatchColor = computed(() => props.timer.isActive ? '#00d4ff' : '#888')
</script>
<template>
    <div class="stopwatch-timer" :class="{ running: timer.isActive }">

        <div class="progress-container">
            <div class="progress-bar" :style="{ width: timer.isActive ? '100%' : '0%', backgroundColor: stopwatchColor }" />
        </div>
        <div class="timer-wrapper">
            <div class="image">
                <img :src="widgetImage" alt="" class="timer-image" @click.stop="emit('image-click')">
            </div>
            <div class="timer-body">
                <div class="timer-top">
                    <InlineEdit class="timer-name" :model-value="timerName" @save="onSaveName">
                        {{ timerName }}
                    </InlineEdit>
                </div>
                <div class="timer-middle">
                    <div class="time-remaining">
                        <span class="time-left">{{ time }}</span>
                    </div>
                </div>
                <div class="timer-bottom">
                    <div class="timer-controls">
                        <i @click="reset" class='bx bx-rewind-circle'></i>

                        <i v-if="!timer.isActive" @click="start" class='bx bx-play-circle'></i>
                        <i v-else @click="stop" class='bx bx-pause-circle'></i>

                        <i class='bx bx-edit disabled'></i>
                        <i @click="reset" class='bx bx-x'></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-bar" :style="{ width: timer.isActive ? '100%' : '0%', backgroundColor: stopwatchColor }" />
        </div>
    </div>
</template>
<style scoped>
.stopwatch-timer {
    box-shadow: 5px 5px 10px black;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 5px;
    font-family: 'Share Tech Mono', sans-serif;
    background-color: black;
    border: 2px solid #444; /* Standard border */
    transition: all 0.5s;
    overflow: hidden;
}
/* Match the green glow of countdown when running, but blue for stopwatch */
.stopwatch-timer.running {
    border-color: #00d4ff !important;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.35);
}
.timer-wrapper { width: 100%; display: flex; align-items: center; }
.timer-wrapper .image { padding: .5em 0 .5em .5em; display: flex; flex-direction: column; justify-content: center;}
.timer-image {
    padding: 0.5em;
    outline: 1px solid white;
    width: min(80px, 15vw);
    aspect-ratio: 1 / 1;
    object-fit: contain;
    cursor: pointer;
    transition: transform 0.15s ease;
}
.timer-image:hover { transform: scale(1.05); }
.timer-body { width: 100%; }
.timer-top, .timer-bottom {
    min-height: 22px;
}
.timer-top, .timer-middle, .timer-bottom {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    color: white;
}
.timer-middle .time-remaining {
    min-height: 2.5em;
    display: flex;
    align-items: center;
    justify-content: center;
}
.time-left { font-size: 2em; padding: 0 .5em; }
/* Controls matching Countdown exactly */
.timer-controls i { margin: 0 10px; font-size: .9em; cursor: pointer; color: #ccc; transition: color 0.2s; }
.timer-controls i:hover:not(.disabled) { color: white; }
.disabled { color: #333 !important; cursor: not-allowed !important; }
/* Progress Bar matching Countdown */
.progress-container { width: 100%; height: 0.25rem; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
.progress-bar { height: 100%; transition: width 0.3s ease, background-color 0.5s ease; }
.timer-top, .timer-bottom { padding: 5px 0;}
</style>
