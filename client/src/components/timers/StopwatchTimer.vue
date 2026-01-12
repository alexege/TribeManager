<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timer.store'
import InlineEdit from '@/components/inputs/InlineEdit.vue'

const props = defineProps(['timer', 'widgetId'])
const timerStore = useTimerStore()

const time = ref('00:00:00:00')
const intervalId = ref(null)

onMounted(() => {
    // Initialize display from stored state
    updateDisplay()

    // If timer was running, restart the interval
    if (props.timer.isActive) {
        startInterval()
    }
})

onUnmounted(() => {
    // Clean up interval but DON'T stop the timer
    if (intervalId.value) {
        clearInterval(intervalId.value)
    }
})

// Watch for changes to the timer (in case it's controlled externally)
watch(() => props.timer, () => {
    updateDisplay()

    // Start/stop interval based on isActive state
    if (props.timer.isActive && !intervalId.value) {
        startInterval()
    } else if (!props.timer.isActive && intervalId.value) {
        clearInterval(intervalId.value)
        intervalId.value = null
    }
}, { deep: true })

function start() {
    if (props.timer.isActive) return

    // Initialize timing if first start
    if (!props.timer.timeBegan) {
        timerStore.updateTimer(props.widgetId, {
            timeBegan: Date.now(),
            stoppedDuration: 0,
            isActive: true
        })
    } else {
        // Resume from pause
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
</script>

<template>
    <div class="stopwatch-timer">

        <div class="timer-wrapper">

        <div class="image">
            <img src="../../assets/dinos/silhouette/Countdown.png" alt="">
        </div>

        <div class="timer-body">
            <div class="timer-top">
                <InlineEdit class="timer-name" placeholder="Timer Name" @save="(val) => timerStore.updateTimer(activeTimer.id, val)">
                    {{ timerName.value || 'Timer Name' }}
                </InlineEdit>
            </div>

            <div class="timer-middle">
                <div class="time-remaining" :style="[{ borderTop: '2px solid white' },{ borderBottom: '2px solid white' }]">
                    <span class="time-elapsed">{{ time }}</span>
                </div>
            </div>
            <div class="timer-bottom">
                <div class="timer-controls">
                    <i v-if="!timer.isActive" @click="start" class='bx bx-play-circle'></i>
                    <i v-else @click="stop" class='bx bx-pause-circle'></i>
                    <i @click="reset" class='bx bx-reset'></i>
                </div>
            </div>
        </div>
        </div>

    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.stopwatch-timer {
    box-shadow: 5px 5px 10px black;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: relative;
    border: 2px solid white;
    box-sizing: border-box;
    border-radius: 5px;
    font-family: 'Share Tech Mono', sans-serif;
    background-color: black;
    transition: box-shadow 0.5s, transform 0.5s;
}

.timer-wrapper {
    display: flex;
    align-items: Center;
}

.timer-wrapper .image {
    padding: .5em 0 .5em .5em;
}

.timer-wrapper .image img {
    width: 100px;
    height: 100px;
}

.timer-body {
    width: 100%;
    padding: .5em;
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

.timer-top {
    padding: 10px 0;
}

.timer-middle {
    flex-direction: column;
}

.timer-middle .time-elapsed {
    display: flex;
    align-items: center;
    font-size: 2em;
}

.timer-middle .time-remaining {
    min-height: 3.75em;
    display: flex;
    align-items: center;
}

.timer-bottom {
    padding: 10px 0;
}

.timer-bottom .timer-controls i {
    /* padding: .10em .25em; */
    cursor: pointer;
    margin: 0 10px;
}

.timer-bottom .timer-controls i:hover {
    color: white;
}
</style>