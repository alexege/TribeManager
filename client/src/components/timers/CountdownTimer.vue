<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timer.store.js'
import soundService from '@/utils/soundService.js'

const props = defineProps(['timer', 'widgetId'])

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

onMounted(() => {
    // Initialize from stored timer state
    if (props.timer.isActive && props.timer.endDateTime) {
        const remaining = new Date(props.timer.endDateTime).getTime() - Date.now()
        if (remaining > 0) {
            timeRemaining.value = remaining
            const time = msToTimeFormat(remaining).split(':')
            days.value = parseInt(time[0])
            hours.value = parseInt(time[1])
            minutes.value = parseInt(time[2])
            seconds.value = parseInt(time[3])
            initialStartValue.value = props.timer.duration || remaining
            startCountDown()
        } else {
            // Timer expired while page was closed
            timerComplete.value = true
            percentLeft.value = 0
        }
    } else if (props.timer.duration) {
        timeRemaining.value = props.timer.duration
        const time = msToTimeFormat(props.timer.duration).split(':')
        days.value = parseInt(time[0])
        hours.value = parseInt(time[1])
        minutes.value = parseInt(time[2])
        seconds.value = parseInt(time[3])
        initialStartValue.value = props.timer.duration
    }
})

onUnmounted(() => {
    if (countDownId.value) {
        clearInterval(countDownId.value)
    }
})

const onStart = () => {
    if (timeRemaining.value <= 0) return

    if (editTimerTime.value) editTimerTime.value = false

    initialStartValue.value = days.value * 86400000 + hours.value * 3600000 + minutes.value * 60000 + seconds.value * 1000

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

    let now = Date.now()
    const desiredDelay = 1000

    countDownId.value = setInterval(() => {
        timeRemaining.value -= 1000

        if (timeRemaining.value <= 0) {
            timeRemaining.value = 0
            percentLeft.value = 0
            timerComplete.value = true

            clearInterval(countDownId.value)

            timerStore.updateTimer(props.widgetId, {
                isActive: false,
                duration: 0
            })

            soundService.play()

            triggerNotification(`${timerFromStore.value?.name || 'Timer Name'} has completed!`, 'success', 3000, false  )

            return
        }

        percentLeft.value = Math.floor((timeRemaining.value / initialStartValue.value) * 100)

        const time = msToTimeFormat(timeRemaining.value).split(':')
        days.value = parseInt(time[0])
        hours.value = parseInt(time[1])
        minutes.value = parseInt(time[2])
        seconds.value = parseInt(time[3])

        now += desiredDelay
    }, desiredDelay)
}

const stopCountDown = () => {
    timerActive.value = false
    if (countDownId.value) {
        clearInterval(countDownId.value)
        countDownId.value = null
    }

    timerStore.updateTimer(props.widgetId, {
        isActive: false,
        duration: timeRemaining.value
    })
}

const onPause = () => {
    stopCountDown()
}

const onReset = () => {
    stopCountDown()

    timeRemaining.value = initialStartValue.value
    percentLeft.value = 100
    timerComplete.value = false

    const time = msToTimeFormat(initialStartValue.value).split(':')
    days.value = parseInt(time[0])
    hours.value = parseInt(time[1])
    minutes.value = parseInt(time[2])
    seconds.value = parseInt(time[3])

    timerStore.updateTimer(props.widgetId, {
        duration: initialStartValue.value,
        isActive: false,
        endDateTime: null
    })
}

const onClear = () => {
    stopCountDown()

    timerActive.value = false
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    timeRemaining.value = 0
    percentLeft.value = 100
    timerComplete.value = false

    timerStore.updateTimer(props.widgetId, {
        duration: 0,
        isActive: false,
        endDateTime: null
    })

    editTimerTime.value = true
}

const msToTimeFormat = (ms) => {
    if (ms < 0) return '00:00:00:00'
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))

    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

watch(
    [days, hours, minutes, seconds],
    ([newDays, newHours, newMinutes, newSeconds]) => {
        if (newHours >= 24) {
            hours.value = (newHours - 24) > 0 ? newHours - 24 : 0
            days.value++
        }
        if (newMinutes >= 60) {
            minutes.value = (newMinutes - 60) > 0 ? newMinutes - 60 : 0
            hours.value++
        }
        if (newSeconds >= 60) {
            seconds.value = (newSeconds - 60) > 0 ? newSeconds - 60 : 0
            minutes.value++
        }

        timeRemaining.value =
            days.value * 86400000 +
            hours.value * 3600000 +
            minutes.value * 60000 +
            seconds.value * 1000

        if (timeRemaining.value === initialStartValue.value) percentLeft.value = 100
        if (timeRemaining.value === 0) percentLeft.value = 0
    }
)

const updateTimeRemaining = () => {
    initialStartValue.value = timeRemaining.value
}

const editTime = () => {
    editTimerTime.value = !editTimerTime.value
    if (timerActive.value) {
        onPause()
    }
}

const backgroundStyle = computed(() => {
    const colors = [
        { r: 255, g: 0, b: 0 },     // Red
        { r: 255, g: 255, b: 0 },   // Yellow
        { r: 0, g: 255, b: 0 },     // Green
    ]

    const numColors = colors.length - 1
    const scaledValue = (percentLeft.value / 100) * numColors
    const lowerIndex = Math.floor(scaledValue)
    const upperIndex = Math.min(lowerIndex + 1, numColors)
    const blendFactor = scaledValue - lowerIndex

    const color1 = colors[lowerIndex]
    const color2 = colors[upperIndex]

    const r = Math.round(color1.r + blendFactor * (color2.r - color1.r))
    const g = Math.round(color1.g + blendFactor * (color2.g - color1.g))
    const b = Math.round(color1.b + blendFactor * (color2.b - color1.b))

    return `rgb(${r}, ${g}, ${b})`
})

import notificationService from '@/utils/notificationService.js'
import InlineEdit from '../inputs/InlineEdit.vue'
const triggerNotification = (message, type, duration, persistent) => {
    notificationService.addNotification(message, type, duration, persistent)
}

const timerFromStore = computed(() =>
  timerStore.getTimerById(props.widgetId)
)

const timerName = computed(() =>
  timerFromStore.value?.name || 'Timer'
)
</script>

<template>
    <div class="countdown-timer" :class="{ timerComplete }"
        :style="{ border: `2px solid ${backgroundStyle}`, transition: 'background-color 0.5s' }">

            <div class="timer-top">
                <InlineEdit class="timer-name" :model-vale="timerName.value" placeholder="Timer Name" @save="(val) => timerStore.updateTimer(activeTimer.id, val)">
                    {{ timerName.value || 'Timer Name' }}
                </InlineEdit>
            </div>

          <div class="timer-middle">
              <div class="time-remaining" :style="[{ borderBottom: `2px solid ${backgroundStyle}`, transition: 'background-color 0.5s' },{ borderTop: `2px solid ${backgroundStyle}`, transition: 'background-color 0.5s' }]">
                  <template v-if="editTimerTime">
                      <div class="time-input">
                          <div class="input-control">
                              <label>days</label>
                              <input type="number" min="0" max="100" v-model.number="days" placeholder="Days"
                                  @change="updateTimeRemaining" @keydown.enter="onStart()" />
                          </div>
                          <span>:</span>
                          <div class="input-control">
                              <label>hours</label>
                              <input type="number" min="0" max="100" v-model.number="hours" placeholder="Hours"
                                  @change="updateTimeRemaining" @keydown.enter="onStart()" />
                          </div>
                          <span>:</span>
                          <div class="input-control">
                              <label>mins</label>
                              <input type="number" min="0" max="100" v-model.number="minutes" placeholder="Minutes"
                                  @change="updateTimeRemaining" @keydown.enter="onStart()" />
                          </div>
                          <span>:</span>
                          <div class="input-control">
                              <label>secs</label>
                              <input type="number" min="0" max="100" v-model.number="seconds" placeholder="Seconds"
                                  @change="updateTimeRemaining" @keydown.enter="onStart()" />
                          </div>
                      </div>
                  </template>
                  <template v-else>
                      <span class="time-left">{{ msToTimeFormat(timeRemaining) }}</span>
                  </template>
              </div>
          </div>
        <div class="timer-bottom">
            <div class="timer-controls">
                <i @click="onReset()" class='bx bx-rewind-circle' :class="{ disabled: timeRemaining <= 0 && !timerComplete }"></i>
                <template v-if="timerActive">
                    <i @click="onPause()" class='bx bx-pause-circle'></i>
                </template>
                <template v-else>
                    <i @click="onStart()" class='bx bx-play-circle' :class="{ disabled: timeRemaining <= 0 }"></i>
                </template>

                <i @click="editTime" class='bx bx-edit'></i>
                <i @click="onClear()" class='bx bx-x'></i>
            </div>
        </div>

        <div class="time-up-overlay" v-if="timerComplete">
          <div class="timer-overlay">
            <div>{{ timerName.value || 'Timer Name' }}</div>
            <div>Time's Up!</div>
            <div class="timer-up-controls">
                <i @click="onReset(); timerComplete = false" class='bx bx-reset'></i>
            </div>
        </div>
        </div>
    </div>
</template>

<style scoped>
.disabled {
    color: gray;
    opacity: 0.25;
    cursor: not-allowed !important;
}

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
}

.timer-top,
.timer-middle,
.timer-bottom {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    color: white;
}

i {
    cursor: pointer;
}

i:not(.disabled):hover {
    color: white;
}

.timer-top {
    padding: 10px 0;
}

.timer-middle {
    flex-direction: column;
}

.timer-middle .time-remaining {
    min-height: 3.75em;
    display: flex;
    align-items: center;
}

.timer-middle .time-remaining .time-input {
    display: flex;
    justify-content: center;
    align-items: center;
}

.timer-middle .time-remaining .time-input span {
    padding: 0.25em;
    align-self: flex-end;
}

.timer-middle .time-remaining .time-left {
    font-size: 2em;
    padding: 0 .5em;
}

.timer-middle .time-input .input-control {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.timer-middle .time-input .input-control input[type='number'] {
    font-size: 1em;
    width: 40px;
}

.timer-middle .timer-controls i {
    padding: 0.1em 0.25em;
    font-size: 20px;
}

.timer-bottom {
    padding: 10px 0;
}

.timer-bottom .timer-controls i {
    margin: 0 10px;
}

.timer-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: rgba(255, 0, 0, 0.15);
}

.time-up-overlay {
    position: absolute;
    /* top: 0; */
    /* left: 0; */
    width: 100%;
    height: 100%;
    background: black;
    outline: 1px solid black;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 5px;
}

.timer-up-controls {
    display: flex;
    justify-content: center;
    gap: .5em;
    padding-top: .5em;
}

.timer-up-controls i {
    font-size: 2em;
}
</style>