<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTimerStore } from '@/stores/timer.store.js'

const props = defineProps(['timer'])
const emit = defineEmits(['close'])

const timerStore = useTimerStore()
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const timeRemaining = ref(0)
const initialStartValue = ref()
const timerActive = ref(false)
const percentLeft = ref(100)
const timerComplete = ref(false)

onMounted(() => {
    console.log(`props.timer.endDateTime: ${props.timer.endDateTime}`)
    if (props.timer.isActive) {
        if (props.timer.endDateTime) {
            const calcFutureDate = msToTimeFormat(new Date(props.timer.endDateTime).getTime() - Date.now()).split(':')
            console.log(`calcFutureDate: ${calcFutureDate}`)
            if (calcFutureDate != 0) {
                days.value = calcFutureDate[0],
                    hours.value = calcFutureDate[1],
                    minutes.value = calcFutureDate[2],
                    seconds.value = calcFutureDate[3]
            }
        }

        startCountDown()

    } else {
        if (props.timer.duration) {
            const timeRem = msToTimeFormat(props.timer.duration).split(':')
            if (timeRem != 0) {
                days.value = timeRem[0],
                    hours.value = timeRem[1],
                    minutes.value = timeRem[2],
                    seconds.value = timeRem[3]
            }
        }
    }

    initialStartValue.value = days.value * 86400000 + hours.value * 3600000 + minutes.value * 60000 + seconds.value * 1000
})

const onStart = () => {

    if (timeRemaining.value == 0) return

    if (editTimerTime.value) editTimerTime.value = false

    initialStartValue.value = days.value * 86400000 + hours.value * 3600000 + minutes.value * 60000 + seconds.value * 1000

    if (props.timer.isActive) {
        startCountDown()
    } else {
        // Update Timer On Start if isActive value is different

        timerStore.updateTimer({
            _id: props.timer._id,
            endDateTime: Date.now() + timeRemaining.value,
            isActive: true,
            duration: timeRemaining.value
        })
    }
}

const countDownId = ref();
const startCountDown = () => {
    timerActive.value = true

    let now = Date.now()
    let desiredDelay = 1000
    let actualDelay = 1000

    countDownId.value = setInterval(() => {

        var actual = Date.now() - now
        actualDelay = desiredDelay - (actual - desiredDelay)

        timeRemaining.value -= 1000
        percentLeft.value = Math.floor((timeRemaining.value / initialStartValue.value) * 100)

        if (timeRemaining.value == 0) {
            percentLeft.value = 0
            timerComplete.value = true
            triggerNotification(`${props.timer.name} timer has expired!`, 'success', 3000, true)
        }

        let end = now + timeRemaining.value
        let remainder = end - now

        if (remainder <= 0) {
            console.log(`${props.timer.name} timer has expired!`)
            clearTimeout(countDownId.value)
        }
    }, actualDelay)
}

const stopCountDown = () => {
    const updateTimer = {
        _id: props.timer._id,
        isActive: false,
        duration: timeRemaining.value
    }
    timerStore.updateTimer(updateTimer)

    timerActive.value = false
    clearTimeout(countDownId.value)
}

watch(() => props.timer.isActive, (newVal, oldVal) => {
    //Update the duration
    const updateTimer = {
        _id: props.timer._id,
        duration: timeRemaining.value
    }

    timerStore.updateTimer(updateTimer)

    if (newVal == true) {
        startCountDown()
    } else {
        stopCountDown()
    }
})

const onPause = () => {

    stopCountDown()

    const pausedTime = msToTimeFormat(timeRemaining.value).split(':')
    if (timeRemaining.value != 0) {
        days.value = pausedTime[0],
            hours.value = pausedTime[1],
            minutes.value = pausedTime[2],
            seconds.value = pausedTime[3]
    }
}
const onReset = () => {
    //Stop Timer
    stopCountDown()

    //Set time back to start time
    timeRemaining.value = initialStartValue.value

    if (initialStartValue.value === undefined) initialStartValue.value = days.value * 86400000 + hours.value * 3600000 + minutes.value * 60000 + seconds.value * 1000

    //Reset values back to starting values
    const startingTime = msToTimeFormat(initialStartValue.value).split(':')
    if (timeRemaining.value == 0) {
        ; (days.value = 0), (hours.value = 0), (minutes.value = 0), (seconds.value = 0)
    } else {
        ; (days.value = startingTime[0]),
            (hours.value = startingTime[1]),
            (minutes.value = startingTime[2]),
            (seconds.value = startingTime[3])
    }
}

const onClear = () => {
    stopCountDown()

    timerActive.value = false;
    days.value = 0;
    hours.value = 0;
    minutes.value = 0;
    seconds.value = 0;
    timeRemaining.value = 0;

    editTimerTime.value = !editTimerTime.value;
}

//Convert ms to '00:00:00:00' string
const msToTimeFormat = (ms) => {
    if (ms < 0) return '00:00:00:00'
    var seconds = Math.floor((ms / 1000) % 60)
    var minutes = Math.floor((ms / (1000 * 60)) % 60)
    var hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    var days = Math.floor(ms / (1000 * 60 * 60) / 24)
    days = days < 10 ? '0' + days : days
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds
    return `${days}:${hours}:${minutes}:${seconds}`
}

//Watch for value changes and update accordingly
watch(
    [days, hours, minutes, seconds],
    ([newDays, newHours, newMinutes, newSeconds], [oldDays, oldHours, oldMinutes, oldSeconds]) => {
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

        if (timeRemaining.value == initialStartValue.value) percentLeft.value = 100
        if (timeRemaining.value == 0) percentLeft.value = 0
        // console.log(`${newDays}:${newHours}:${newMinutes}:${newSeconds}`)
    }
)
// Edit Timer
const editTimer = ref({
    name: props.timer.name
})
const isEditTimerName = ref(false)
const editTimerTime = ref(false)
const updateTimerName = () => {
    let updateData = {
        _id: props.timer._id,
        name: editTimer.value.name
    }
    timerStore.updateTimer(updateData)
    //Close Edit Input
    isEditTimerName.value = false
}
const editTime = () => {
    editTimerTime.value = !editTimerTime.value
    onPause()
}
const deleteTimer = () => {
    emit('close', props.timer._id)
}
const updateTimeRemaining = () => {
    initialStartValue.value = timeRemaining.value
}

//Progress Bar
const progressColor = computed(() => {
    let color = 'rgba(50,205,50,0.75)'
    let color2 = 'rgba(50,205,50,0.05)'

    if (percentLeft.value <= 60) {
        color = 'rgba(240, 255, 0, 0.75)'
        color2 = 'rgba(240, 255, 0, 0.05)'
    }
    if (percentLeft.value <= 30) {
        color = 'rgba(255, 0, 0, 0.75)'
        color2 = 'rgba(255, 0, 0, 0.05)'
    }
    return { foreground: color, background: color2 }
})

// Reactive state
// const value = ref(0); // Value between 0 and 1
const colors = [
    { r: 255, g: 0, b: 0 }, // Red
    { r: 255, g: 255, b: 0 }, // Yellow
    { r: 0, g: 255, b: 0 }, // Green
];

// Computed property for background style
const backgroundStyle = computed(() => {
    const numColors = colors.length - 1;
    const scaledValue = (percentLeft.value / 100) * numColors;
    const lowerIndex = Math.floor(scaledValue);
    const upperIndex = Math.min(lowerIndex + 1, numColors);
    const blendFactor = scaledValue - lowerIndex;

    // Get the two colors to blend
    const color1 = colors[lowerIndex];
    const color2 = colors[upperIndex];

    // Interpolate each RGB component
    const r = Math.round(color1.r + blendFactor * (color2.r - color1.r));
    const g = Math.round(color1.g + blendFactor * (color2.g - color1.g));
    const b = Math.round(color1.b + blendFactor * (color2.b - color1.b));

    // Return the computed style
    return `rgb(${r}, ${g}, ${b})`;
});

// import notificationService from '@/utils/notificationService.js'
// const triggerNotification = (message, type, duration, persistent) => {
//     console.log("Testing");
//     notificationService.addNotification(message, type, duration, persistent)
// }

// const handleNotificationClick = (id) => {
//     notificationService.removeNotification(id)
// }

</script>
<template>
    <div class="countdown-timer" :class="{ timerComplete }"
        :style="[{ border: `2px solid ${backgroundStyle}` }, { transition: 'background-color 0.5s' }]">

        <!-- Top -->
         <!-- <div class="timer-top"></div> -->

        <!-- Middle -->
        <div class="timer-middle">
            <div class="time-remaining" :style="[
                { borderBottom: `2px solid ${backgroundStyle}` },
                { transition: 'background-color 0.5s' }
              ]">
              <!-- { borderTop: `2px solid ${backgroundStyle}` }, -->
                <template v-if="editTimerTime">
                    <div class="time-input">
                        <div class="input-control">
                            <label>days</label>
                            <input type="number" min="0" max="100" v-model="days" placeholder="Days"
                                @change="updateTimeRemaining" @keydown.enter="onStart()" />
                        </div>
                        <span>:</span>
                        <div class="input-control">
                            <label>hours</label>
                            <input type="number" min="0" max="100" v-model="hours" placeholder="Hours"
                                @change="updateTimeRemaining" @keydown.enter="onStart()" />
                        </div>
                        <span>:</span>
                        <div class="input-control">
                            <label>mins</label>
                            <input type="number" min="0" max="100" v-model="minutes" placeholder="Minutes"
                                @change="updateTimeRemaining" @keydown.enter="onStart()" />
                        </div>
                        <span>:</span>
                        <div class="input-control">
                            <label>secs</label>
                            <input type="number" min="0" max="100" v-model="seconds" placeholder="Seconds"
                                @change="updateTimeRemaining" @keydown.enter="onStart()" />
                        </div>
                    </div>
                </template>
                <template v-else>
                    <span class="time-left">{{ msToTimeFormat(timeRemaining) }}</span>
                </template>
            </div>
        </div>

        <!-- Bottom -->
        <div class="timer-bottom">
            <div class="timer-controls">
                <i @click="onReset()" class='bx bx-rewind-circle' :class="{ disabled: timeRemaining <= 0 }"></i>
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
            <h2>{{ timer.name }}</h2>
            <h2>Timer is Up!</h2>
            <div class="timer-up-controls">
                <i @click="onReset(); timerComplete = false" class='bx bx-reset'></i>
                <i @click="deleteTimer" class='bx bx-x'></i>
            </div>
        </div>

    </div>
</template>
<style scoped>
.timerComplete {
    background: rgba(255, 0, 0, 0.15);
}

.disabled {
    color: gray;
    opacity: 0.25;
}

.countdown-timer {
    box-shadow: 5px 5px 10px black;
    box-sizing: border-box;
    /* padding: 5px; */
    /* height: 9em; */
    /* height: 100%; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    /* height: 100%; */
    position: relative;
    /* border: 1px solid white; */
    border-radius: 5px;
    font-family: 'Share Tech Mono', sans-serif;
    background-color: black;

    transition: box-shadow 0.5s, transform 0.5s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* .countdown-timer:hover {
    transform: translateY(-5px);
} */

.timer-top,
.timer-middle,
.timer-bottom {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    color: white;
}

/* Generic */
i {
    cursor: pointer;
}

i:hover {
    color: white;
}

/* Top */
.timer-top {
    flex: 1;
    padding: 10px 0;
}

.timer-top .timer-title {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-align: center;
    overflow: auto;
    max-height: 50px;
    max-width: 80%;
}

.timer-top .close {
    position: absolute;
    top: 0;
    right: 0;
    margin: 2.5px 5px;
}

.timer-top .controls {
    display: flex;
    /* outline: 1px solid white; */
    position: absolute;
    top: 5px;
    right: 5px;
}

/* Middle */
.timer-middle {
    /* flex: 2; */
    flex-direction: column;
}

.timer-middle .time-remaining {
    min-height: 60px;
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

/* Bottom */
.timer-bottom {
    padding: 10px 0;
}

.timer-bottom .timer-controls i {
    margin: 0 10px;
}

.progressbar {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    background: black;
}

.progressbar .text {
    border: 1px solid white;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
}

.progressbar .background {
    background-color: v-bind('main_bg_color');
    color: white;
}

.progressbar .bar {
    /* position: absolute;
    top: 0;
    bottom: 0;
    transition: width 1s;
    background-color: limegreen;
    animation: colorChange; */

    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    left: 0;
    /* left: 0;
    top: 0;
    right: 0;
    bottom: 0; */
    /* background-color: red; */
}

.time-up-overlay {
    position: absolute;
    top: 0;
    left: 0;
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
}

.timer-up-controls {
    display: flex;
    justify-content: center;
    gap: .5em;
    padding-top: .5em;
}
</style>
