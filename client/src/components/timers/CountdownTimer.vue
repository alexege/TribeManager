<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

/* =========================
   Props / Emits
========================= */
const props = defineProps({
  timer: {
    type: Object,
    required: true,
    /*
      Expected shape:
      {
        id: String,
        duration: Number,   // ms
        isActive: Boolean
      }
    */
  }
})

const emit = defineEmits(['start', 'pause', 'reset', 'complete'])

/* =========================
   Internal State
========================= */
const timeRemaining = ref(props.timer.duration ?? 0)
const initialStartValue = ref(props.timer.duration ?? 0)
const timerActive = ref(props.timer.isActive ?? false)
const timerComplete = ref(false)

/* Editable time units */
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

/* =========================
   Helpers
========================= */
const msToTimeParts = (ms) => {
  if (ms < 0) ms = 0
  const s = Math.floor((ms / 1000) % 60)
  const m = Math.floor((ms / (1000 * 60)) % 60)
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const d = Math.floor(ms / (1000 * 60 * 60 * 24))
  return [d, h, m, s]
}

const timePartsToMs = () =>
  days.value * 86400000 +
  hours.value * 3600000 +
  minutes.value * 60000 +
  seconds.value * 1000

const formatTime = (ms) => {
  const [d, h, m, s] = msToTimeParts(ms)
  return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* =========================
   Initialization
========================= */
const syncFromMs = (ms) => {
  const [d, h, m, s] = msToTimeParts(ms)
  days.value = d
  hours.value = h
  minutes.value = m
  seconds.value = s
}

syncFromMs(timeRemaining.value)

/* =========================
   Drift-Safe Countdown
========================= */
let timeoutId

const tick = () => {
  if (!timerActive.value) return

  timeRemaining.value = Math.max(0, timeRemaining.value - 1000)

  if (timeRemaining.value === 0) {
    timerActive.value = false
    timerComplete.value = true
    emit('complete')
    return
  }

  timeoutId = setTimeout(tick, 1000)
}

/* =========================
   Watchers
========================= */
watch(
  () => props.timer.duration,
  (v) => {
    timeRemaining.value = v
    initialStartValue.value = v
    syncFromMs(v)
  }
)

watch(
  () => props.timer.isActive,
  (active) => {
    timerActive.value = active
    if (active) tick()
    else clearTimeout(timeoutId)
  }
)

watch(
  [days, hours, minutes, seconds],
  () => {
    if (!timerActive.value) {
      timeRemaining.value = timePartsToMs()
    }
  }
)

/* =========================
   Actions
========================= */
const onStart = () => {
  if (timeRemaining.value <= 0) return
  initialStartValue.value = timeRemaining.value
  timerComplete.value = false
  emit('start')
}

const onPause = () => emit('pause')

const onReset = () => {
  timeRemaining.value = initialStartValue.value
  syncFromMs(initialStartValue.value)
  timerComplete.value = false
  emit('reset')
}

/* =========================
   Progress
========================= */
const percentLeft = computed(() => {
  if (!initialStartValue.value) return 0
  return Math.floor((timeRemaining.value / initialStartValue.value) * 100)
})

/* =========================
   Cleanup
========================= */
onUnmounted(() => clearTimeout(timeoutId))
</script>

<template>
  <div class="countdown-timer" :class="{ complete: timerComplete }">
    <!-- Time Display -->
    <div class="time-display">
      <template v-if="!timerActive">
        <input type="number" min="0" v-model.number="days" />
        <span>:</span>
        <input type="number" min="0" max="23" v-model.number="hours" />
        <span>:</span>
        <input type="number" min="0" max="59" v-model.number="minutes" />
        <span>:</span>
        <input type="number" min="0" max="59" v-model.number="seconds" />
      </template>
      <template v-else>
        <span class="time-text">{{ formatTime(timeRemaining) }}</span>
      </template>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button @click="onStart" :disabled="timerActive || timeRemaining <= 0">▶</button>
      <button @click="onPause" :disabled="!timerActive">⏸</button>
      <button @click="onReset">⟲</button>
    </div>

    <!-- Progress -->
    <div class="progress">
      <div class="bar" :style="{ width: percentLeft + '%' }"></div>
    </div>

    <!-- Complete Overlay -->
    <div class="overlay" v-if="timerComplete">
      <strong>Time’s Up!</strong>
    </div>
  </div>
</template>

<style scoped>
.countdown-timer {
  padding: .5em;
  display: flex;
  flex-direction: column;
  gap: .5em;
  background: #000;
  color: white;
  border-radius: 6px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-style: solid;
  border-color: white;
  border-width: 0 1px 1px 1px;
}

.time-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .25em;
}

.time-display input {
  width: 42px;
  text-align: center;
}

.time-text {
  font-size: 1.6em;
  font-family: monospace;
}

.controls {
  display: flex;
  justify-content: center;
  gap: .5em;
}

.progress {
  height: 6px;
  background: #222;
  border-radius: 3px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: limegreen;
  transition: width .3s linear;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4em;
}

.complete {
  outline: 2px solid red;
}
</style>
