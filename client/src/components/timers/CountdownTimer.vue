<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timer.store.js'
import notificationService from '@/utils/notificationService'
import InlineEdit from '../inputs/InlineEdit.vue'
const props = defineProps(['timer', 'widgetId', 'widgetImage', 'widgetName'])
const emit = defineEmits(['image-click'])
const timerStore = useTimerStore()
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const timeRemaining = ref(0)
const initialStartValue = ref(0)
const timerActive = ref(false)
const percentLeft = ref(100)
const timerComplete = ref(false)
const editTimerTime = ref(false)
const countDownId = ref(null)
// --- Initialization ---
onMounted(() => {
    const storedTimer = props.timer

    // 1. Establish the "100%" baseline first
    if (storedTimer.duration) {
        initialStartValue.value = storedTimer.duration
    }
    // 2. Determine current state (Running, Paused, or New)
    if (storedTimer.isActive && storedTimer.endDateTime) {
        const remaining = new Date(storedTimer.endDateTime).getTime() - Date.now()
        if (remaining > 0) {
            timeRemaining.value = remaining
            syncTimeUnits(remaining)
            startCountDown()
        } else {
            setTimerToCompleted()
        }
    } else if (storedTimer.remaining) {
        // Resume from a paused state
        timeRemaining.value = storedTimer.remaining
        syncTimeUnits(storedTimer.remaining)
        calculatePercentage()
    }
    // else if (storedTimer.duration) {
    //     // Fresh timer with a set duration
    //     timeRemaining.value = storedTimer.duration
    //     syncTimeUnits(storedTimer.duration)
    //     calculatePercentage()
    // } // Now handled by watcher
})
onUnmounted(() => {
    if (countDownId.value) clearInterval(countDownId.value)
})
// --- Core Logic ---
const onStart = () => {
    if (timeRemaining.value <= 0) return

    timerComplete.value = false
    if (editTimerTime.value) editTimerTime.value = false
    const totalSetByUser = days.value * 86400000 + hours.value * 3600000 + minutes.value * 60000 + seconds.value * 1000
    if (totalSetByUser <= 0) return
    // Only set new baseline if we aren't resuming or if the timer was previously finished
    // if (initialStartValue.value === 0 || timeRemaining.value === totalSetByUser) {
    //     initialStartValue.value = totalSetByUser
    // }
    initialStartValue.value = totalSetByUser
    timeRemaining.value = totalSetByUser
    const endDateTime = Date.now() + timeRemaining.value
    timerStore.updateTimer(props.widgetId, {
        endDateTime,
        isActive: true,
        duration: initialStartValue.value
    })
    startCountDown()
}
const startCountDown = () => {
    timerActive.value = true
    const desiredDelay = 1000
    countDownId.value = setInterval(() => {
        timeRemaining.value -= 1000
        if (timeRemaining.value <= 0) {
            setTimerToCompleted()
            return
        }
        calculatePercentage()
        syncTimeUnits(timeRemaining.value)
    }, desiredDelay)
}
const setTimerToCompleted = () => {
    timeRemaining.value = 0
    percentLeft.value = 0
    timerComplete.value = true
    timerActive.value = false
    if (countDownId.value) clearInterval(countDownId.value)
    timerStore.updateTimer(props.widgetId, {
        isActive: false,
        duration: initialStartValue.value,
        remaining: 0
    })
    triggerNotification(`${timerName.value} has completed!`, 'success', 3000, false)
}
const stopCountDown = () => {
    timerActive.value = false
    // if (countDownId.value) {
    //     clearInterval(countDownId.value)
    //     countDownId.value = null
    // }
    if (countDownId.value && !timerActive.value) {
        clearInterval(countDownId.value)
        countDownId.value = null
    }
    timerStore.updateTimer(props.widgetId, {
        isActive: false,
        remaining: timeRemaining.value,
        duration: initialStartValue.value // Keep the 100% baseline safe
    })
}
const onPause = () => stopCountDown()
const onReset = () => {
    stopCountDown()
    timerComplete.value = false
    timeRemaining.value = initialStartValue.value
    percentLeft.value = 100
    syncTimeUnits(initialStartValue.value)
    timerStore.updateTimer(props.widgetId, {
        duration: initialStartValue.value,
        isActive: false,
        endDateTime: null,
        remaining: null
    })
}
const onClear = () => {
    stopCountDown()
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    timeRemaining.value = 0
    percentLeft.value = 100
    initialStartValue.value = 0
    timerComplete.value = false
    editTimerTime.value = true
    timerStore.updateTimer(props.widgetId, {
        duration: 0,
        isActive: false,
        endDateTime: null,
        remaining: null
    })
}
// --- Helpers ---
const calculatePercentage = () => {
    if (initialStartValue.value > 0) {
        percentLeft.value = (timeRemaining.value / initialStartValue.value) * 100
    }
}
const syncTimeUnits = (ms) => {
    const time = msToTimeFormat(ms).split(':')
    days.value = parseInt(time[0])
    hours.value = parseInt(time[1])
    minutes.value = parseInt(time[2])
    seconds.value = parseInt(time[3])
}
const msToTimeFormat = (ms) => {
    if (ms <= 0) return '00:00:00:00'
    const s = Math.floor((ms / 1000) % 60)
    const m = Math.floor((ms / (1000 * 60)) % 60)
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24)
    const d = Math.floor(ms / (1000 * 60 * 60 * 24))
    return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
// watch([days, hours, minutes, seconds], () => {
//     // Only auto-calculate timeRemaining if we are in edit mode or paused
//     if (!timerActive.value) {
//         if (seconds.value >= 60) { seconds.value -= 60; minutes.value++ }
//         if (minutes.value >= 60) { minutes.value -= 60; hours.value++ }
//         if (hours.value >= 24) { hours.value -= 24; days.value++ }
//         timeRemaining.value =
//             days.value * 86400000 +
//             hours.value * 3600000 +
//             minutes.value * 60000 +
//             seconds.value * 1000

//         calculatePercentage()
//     }
// })
watch([days, hours, minutes, seconds], () => {
  if (!editTimerTime.value) return
  if (seconds.value >= 60) { seconds.value -= 60; minutes.value++ }
  if (minutes.value >= 60) { minutes.value -= 60; hours.value++ }
  if (hours.value >= 24) { hours.value -= 24; days.value++ }
  timeRemaining.value =
    days.value * 86400000 +
    hours.value * 3600000 +
    minutes.value * 60000 +
    seconds.value * 1000
  calculatePercentage()
})
// watch(
//   () => props.timer.duration,
//   (newDuration) => {
//     if (timerActive.value) return
//     if (!newDuration) return
//     // Stop any active countdown
//     if (countDownId.value) {
//       clearInterval(countDownId.value)
//       countDownId.value = null
//     }
//     timerActive.value = false
//     timerComplete.value = false
//     editTimerTime.value = false
//     // Reset baseline + remaining time
//     initialStartValue.value = newDuration
//     timeRemaining.value = newDuration
//     percentLeft.value = 100
//     syncTimeUnits(newDuration)
//   },
//   { immediate: true }
// )
watch(
  () => props.timer.duration,
  (newDuration) => {
    if (!newDuration) return
    if (timerActive.value) return
    if (countDownId.value) {
      clearInterval(countDownId.value)
      countDownId.value = null
    }
    timerComplete.value = false
    editTimerTime.value = false
    initialStartValue.value = newDuration
    timeRemaining.value = newDuration
    percentLeft.value = 100
    syncTimeUnits(newDuration)
  },
  { immediate: true }
)


const updateTimeRemaining = () => {
    initialStartValue.value = timeRemaining.value
}
const editTime = () => {
    editTimerTime.value = !editTimerTime.value
    if (timerActive.value) onPause()
}
const triggerNotification = (message, type, duration, persistent) => {
    notificationService.addNotification(message, type, duration, persistent)
}
// --- Computeds ---
const backgroundStyle = computed(() => {
    const colors = [{ r: 255, g: 0, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 0, g: 255, b: 0 }]
    const numColors = colors.length - 1
    const scaledValue = (percentLeft.value / 100) * numColors
    const lowerIndex = Math.floor(scaledValue)
    const upperIndex = Math.min(lowerIndex + 1, numColors)
    const blendFactor = scaledValue - lowerIndex
    const c1 = colors[lowerIndex], c2 = colors[upperIndex]
    const r = Math.round(c1.r + blendFactor * (c2.r - c1.r))
    const g = Math.round(c1.g + blendFactor * (c2.g - c1.g))
    const b = Math.round(c1.b + blendFactor * (c2.b - c1.b))
    return `rgb(${r}, ${g}, ${b})`
})
const timerFromStore = computed(() => timerStore.getTimerById(props.widgetId))
const timerName = computed(() => timerFromStore.value?.name || props.widgetName || 'Timer')
const onSaveName = (val) => timerStore.updateWidgetName(props.widgetId, val)
</script>
<template>
    <div class="countdown-timer"
        :class="{ running: timerActive, paused: !timerActive && timeRemaining > 0, completed: timerComplete }"
        :style="{ border: `2px solid ${timerComplete ? '#ff0000' : backgroundStyle}`, transition: 'all 0.5s' }">

        <div class="progress-container">
            <div class="progress-bar" :style="{ width: percentLeft + '%', backgroundColor: backgroundStyle }" />
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
                        <template v-if="editTimerTime">
                            <div class="time-input">
                                <div class="input-control">
                                    <label>days</label>
                                    <div class="input-wrapper">
                                        <input type="number" v-model.number="days" @change="updateTimeRemaining" @keydown.enter="onStart" />
                                        <span>:</span>
                                    </div>
                                </div>
                                <div class="input-control">
                                    <label>hrs</label>
                                    <div class="input-wrapper">
                                        <input type="number" v-model.number="hours" @change="updateTimeRemaining" @keydown.enter="onStart" />
                                        <span>:</span>
                                    </div>
                                </div>
                                <div class="input-control">
                                    <label>mins</label>
                                    <div class="input-wrapper">
                                        <input type="number" v-model.number="minutes" @change="updateTimeRemaining" @keydown.enter="onStart" />
                                        <span>:</span>
                                    </div>
                                </div>
                                <div class="input-control"><label>secs</label><input type="number" v-model.number="seconds" @change="updateTimeRemaining" @keydown.enter="onStart" /></div>
                            </div>
                        </template>
                        <template v-else>
                            <span v-if="timerComplete" class="time-left blink-red">TIME'S UP!</span>
                            <span v-else class="time-left">{{ msToTimeFormat(timeRemaining) }}</span>
                        </template>
                    </div>
                </div>
                <div class="timer-bottom">
                    <div class="timer-controls">
                        <i @click="onReset" class='bx bx-rewind-circle' :class="{ disabled: timeRemaining <= 0 && !timerComplete }"></i>
                        <i v-if="timerActive" @click="onPause" class='bx bx-pause-circle'></i>
                        <i v-else @click="onStart" class='bx bx-play-circle' :class="{ disabled: timeRemaining <= 0 }"></i>
                        <i @click="editTime" class='bx bx-edit'></i>
                        <i @click="onClear" class='bx bx-x'></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-bar" :style="{ width: percentLeft + '%', backgroundColor: backgroundStyle }" />
        </div>
    </div>
</template>
<style scoped>
/* Base Styles */
.countdown-timer {
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
    transition: box-shadow 0.5s, transform 0.5s;
    overflow: hidden;
}
.timer-wrapper { width: 100%; display: flex; align-items: center; }
.timer-wrapper .image { padding: .5em 0 .5em .5em; display: flex; flex-direction: column; justify-content: center;}
.timer-image { padding: 0.5em; outline: 1px solid white; width: min(80px, 15vw); aspect-ratio: 1 / 1; object-fit: contain; cursor: pointer; transition: transform 0.15s ease; }
.timer-image:hover { transform: scale(1.05); }
.timer-body { width: 100%; }
.timer-top { padding: .25em }
.timer-bottom { padding: .25em }
.timer-top, .timer-middle, .timer-bottom { display: flex; width: 100%; align-items: center; justify-content: center; color: white; }
.timer-middle .time-remaining { min-height: 2.5em; display: flex; align-items: center; justify-content: center; position: relative; }
.time-left { font-size: 2em; padding: 0 .5em; }
/* Input Styles */
.time-input { display: flex; justify-content: center; align-items: center; }
.input-control { display: flex; flex-direction: column; align-items: center; margin: 0 5px}
.input-control input { font-size: 1em; width: 35px; background: #222; color: white; border: 1px solid #444; text-align: center; }
.input-control label { font-size: 0.6rem; text-transform: uppercase; color: #888; }
.input-control .input-wrapper { display: flex; align-items: center; position: relative; }
.input-control .input-wrapper span { position: absolute; right: -8px; font-weight: bold;  }
/* .input-control .input-wrapper span { padding: 0 3px;  } */
/* Progress Bar */
.progress-container { width: 100%; height: 0.25rem; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
.progress-bar { height: 100%; transition: width 1s linear, background-color 0.5s ease; }
/* Controls */
.timer-controls i { margin: 0 10px; font-size: .9em; cursor: pointer; color: #ccc; transition: color 0.2s; }
.timer-controls i:hover:not(.disabled) { color: white; }
.disabled { color: #444 !important; cursor: not-allowed !important; opacity: 0.5; }
/* Status Animations */
.countdown-timer.running { box-shadow: 0 0 12px rgba(0, 255, 0, 0.35); }
.countdown-timer.paused { opacity: 0.8; }
/* Expired State */
.blink-red { color: #ff4d4d; animation: blinker 1s linear infinite; }
@keyframes blinker { 50% { opacity: 0; } }
.countdown-timer.completed {
    border-color: #ff0000 !important;
    animation: pulse-red 1.2s infinite, shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(255, 0, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
}
@keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
}
</style>