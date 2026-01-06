<script setup>
import { ref } from 'vue'
import { useTimerStore } from '../../stores/timer.store';

var time = ref('00:00:00:00')
var timeBegan = ref(null)
var timeStopped = ref(null)
var stoppedDuration = ref(0)
var started = ref(null)
var running = ref(false)
const props = defineProps(['timer'])
const emit = defineEmits(['close'])

function start() {
    if (running.value) return;
    if (timeBegan.value === null) {
        reset();
        timeBegan.value = new Date();
    }
    if (timeStopped.value !== null) {
        stoppedDuration.value += (new Date() - timeStopped.value);
    }
    started.value = setInterval(clockRunning, 10);
    running.value = true;
}

function stop() {
    running.value = false;
    timeStopped.value = new Date();
    clearInterval(started.value);
}

function reset() {
    running.value = false;
    clearInterval(started.value);
    stoppedDuration.value = 0;
    timeBegan.value = null;
    timeStopped.value = null;
    time.value = "00:00:00:00";
}

function clockRunning() {
    var currentTime = new Date()
    var timeElapsed = new Date(currentTime - timeBegan.value - stoppedDuration.value)
    var hour = timeElapsed.getUTCHours()
    var min = timeElapsed.getUTCMinutes()
    var sec = timeElapsed.getUTCSeconds()
    var ms = timeElapsed.getUTCMilliseconds()
    time.value = zeroPrefix(hour, 2) + ":" +
        zeroPrefix(min, 2) + ":" +
        zeroPrefix(sec, 2) + ":" +
        zeroPrefix(ms, 2);
}

function zeroPrefix(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}

function deleteTimer(timerId) {
    emit('close', timerId)
}

const { updateTimer } = useTimerStore()
const editTimerName = ref(false);
const editTimer = {
    name: props.timer.name
}

async function updateTimerName() {
    var data = {
        _id: props.timer._id,
        name: editTimer.name
    }
    await updateTimer(data)
    editTimerName.value = false;
}

</script>

<template>
    <div class="stopwatch-timer">
        <div class="timer-middle">
            <span class="time-elapsed"
                :style="[{ borderBottom: `2px solid white` }]
                ">{{
                    time }}</span>
        </div>
        <div class="timer-bottom">
            <div class="btn-container">
                <i v-if="!running" @click="start" class='bx bx-play-circle'></i>
                <i v-else @click="stop" class='bx bx-pause-circle'></i>
                <i @click="reset" class='bx bx-reset'></i>

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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stopwatch-timer:hover {
    transform: translateY(-5px);
}

/* Generic */
.timer-top,
.timer-middle,
.timer-bottom {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;

    color: white;
}

/* Top  */
.timer-top {
    padding: 10px 0;
}

/* .timer-top .close {
    position: absolute;
    top: 0;
    right: 0;
    margin: 2.5px 2.5px;
    cursor: pointer;
} */

.timer-top .controls {
    position: absolute;
    top: 0;
    right: 0;
    margin: 2.5px 2.5px;
    cursor: pointer;
}

/* Middle */
.timer-middle {
    flex-direction: column;
}

.timer-middle .time-elapsed {
    font-size: 2em;
    /* padding: 0 .5em; */
    min-height: 60px;

    display: flex;
    align-items: center;
}

/* Bottom */
.timer-bottom {
    padding: 10px 0;
}

.timer-bottom .btn-container i {
    padding: .10em .25em;
    /* font-size: 20px; */
    cursor: pointer;
}
</style>