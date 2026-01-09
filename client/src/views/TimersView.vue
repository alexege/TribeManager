<script setup>
import { ref, nextTick, watch } from 'vue'
import ToggleSwitch from '@/components/inputs/ToggleSwitch.vue'
import TimerWidget from '@/components/widgets/TimerWidget.vue'
import { useTimerStore } from '@/stores/timer.store'

const store = useTimerStore()
const showDrag = ref(false)

const gridVisible = computed(() => {
  return store.showGrid || showDrag.value
})

/* ================================
   FLIP: widget DOM registry
================================ */
const widgetEls = new Map()

const registerWidgetEl = (id, el) => {
  if (el) widgetEls.set(id, el.$el)
}

/* ================================
   FLIP animation helper
================================ */
const animateWidgets = async (firstPositions) => {
  await nextTick()

  for (const [id, first] of firstPositions.entries()) {
    const el = widgetEls.get(id)
    if (!el) continue

    const last = el.getBoundingClientRect()
    const dx = first.left - last.left
    const dy = first.top - last.top

    if (dx || dy) {
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`
      el.style.transition = 'none'

      requestAnimationFrame(() => {
        el.style.transition = 'transform 360ms cubic-bezier(.22,1,.36,1)' //No Spring
        // el.style.transition = 'transform 420ms cubic-bezier(.34,1.56,.64,1)' //Spring Effect
        el.style.transform = ''
      })
    }
  }
}

/* ================================
   Existing drag handlers
================================ */
const handleDragStart = () => {
  showDrag.value = true
}

const handleDragOver = (e, zoneId) => {
  e.preventDefault()
  store.setHoveredZone(zoneId)
}

const handleDragLeave = () => {
  store.setHoveredZone(null)
}

const handleDrop = async (e) => {
  e.preventDefault()

  showDrag.value = false

  // 1️⃣ Capture FIRST positions BEFORE mutation
  const firstPositions = new Map()

  store.widgets.forEach(w => {
    const el = widgetEls.get(w.id)
    if (el) firstPositions.set(w.id, el.getBoundingClientRect())
  })

  // 2️⃣ Mutate state (swap / move happens here)
  store.endDrag()

  // 3️⃣ Animate to new positions
  await animateWidgets(firstPositions)
}

const setColumnsWithFlip = async (cols) => {
  const firstPositions = new Map()

  store.widgets.forEach(w => {
    const el = widgetEls.get(w.id)
    if (el) firstPositions.set(w.id, el.getBoundingClientRect())
  })

  store.setCols(cols)

  await animateWidgets(firstPositions)
}
import { computed } from 'vue'
const numDropZones = computed(() => {
  return store.numDropZones;
})

</script>

<template>
  <div class="timers-view">
    <div class="toolbar">
      <div class="toolbar-section">
        <button @click="store.addCountdown"><span class="operator">+</span> Countdown</button>
        <button @click="store.addStopwatch"><span class="operator">+</span> Stopwatch</button>
      </div>

      <div class="toolbar-divider"></div>

        <div class="toolbar-section grid-controls">
          <button @click="store.decreaseDropZones()" :disabled="store.numDropZones <= 1"><span class="operator">−</span></button>
          <input type="numeric" class="num-zones" v-model="store.numDropZones" @keydown.up="store.increaseDropZones" @keydown.down="store.decreaseDropZones">
          <!-- <span class="count">{{ store.numDropZones }}</span> -->
          <button @click="store.increaseDropZones()" :disabled="store.numDropZones >= 150"><span class="operator">+</span></button>
          <ToggleSwitch v-model="store.showGrid"/>
      </div>

    </div>
    <div
      class="timer-grid"
      :class="{'grid--visible': !gridVisible}"
    >
      <div
        v-for="zone in store.dropzones"
        :key="zone.id"
        class="dropzone"
        :class="{
          active: store.isDragging && store.hoveredZoneId === zone.id,
          swap: zone.occupied && store.isDragging && store.hoveredZoneId === zone.id,
          occupied: zone.occupied
        }"
        @dragstart="handleDragStart"
        @dragover="handleDragOver($event, zone.id)"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <TimerWidget
          v-if="store.widgets.find(w => w.zoneId === zone.id)"
          :widget="store.widgets.find(w => w.zoneId === zone.id)"
          :ref="el =>
            registerWidgetEl(
              store.widgets.find(w => w.zoneId === zone.id)?.id,
              el
            )
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.timers-view {
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  overflow-y: auto;
  text-align: center;
  position: relative;
}

/* Toolbar */
.toolbar {
  position: sticky;
  top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 0.75em;
  background: var(--secondary-bg-color);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  z-index: 100;
}


.toolbar button {
  background: none;
  border: none;
  color: white;
  font-size: 0.9em;
  padding: 0.25em 0.75em;
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.2s;
}

.toolbar button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toolbar button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.toolbar-section {
  display: flex;
  gap: 0.5em;
  align-items: center;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
}

.grid-controls {
  gap: 0.4em;
}

.grid-controls .label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  margin-left: 0.3em;
}

.grid-controls .label.active {
  background: rgba(0, 255, 120, 0.2);
  color: white;
  font-weight: 600;
}

.grid-controls .count {
  color: white;
  font-size: 0.9em;
  min-width: 1.5em;
  text-align: center;
  font-weight: 600;
}

.grid-controls input[type="numeric"] {
  color: var(--text-primary);
  background: var(--secondary-bg-color);
  width: 100%;
  width: 24px;
  appearance: none;
  text-align: center;
}

/* Grid Layout */
.timer-grid {
  /* height: 100vh; */
  /* width: 100%; */
  width: 80vw;
  min-height: 100vh;
  /* width: 100vw; */
  /* min-width: 80vw; */
  /* width: 1080px; */
  margin: 0 auto;
  /* height: 100%; */
  display: grid;
  /* grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr); */
  /* grid-template-columns: repeat(var(--grid-cols), minmax(100px, max-content)); */
  /* grid-template-rows: repeat(var(--grid-rows), minmax(100px, max-content)); */
  /* grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); */
  grid-template-columns: repeat(var(--grid-cols, auto-fit), minmax(275px, 1fr));

  grid-auto-rows: 175px;
  /* place-content: center; */

  /* grid-auto-rows: max-content; */
  /* justify-content: center; */
  justify-items: center;
  align-content: start;

  gap: 1em;
  /* padding: 80px 16px 16px 16px; */
  padding: 2em 0 .5em 0;
  box-sizing: border-box;
}

/* Dropzones */
.dropzone {
  width: 100%;
  height: 100%;

  /* max-width: 380px; */

  /* max-width: 320px; */
  /* max-height: 240px; */

  justify-self: center;
  align-self: center;

  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.25);

  display: flex;
  align-items: center;
  justify-content: center;
}

/* .dropzone {
  width: 100%;
  max-width: 320px;
  height: 100%;
  max-height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
  display: flex;
  position: relative;
} */

/* .dropzone {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
  min-height: 160px;
} */

.dropzone.active {
  border-color: rgba(0, 255, 120, 0.8);
  background: rgba(0, 255, 120, 0.08);
  box-shadow: inset 0 0 20px rgba(0, 255, 120, 0.2);
  transform: scale(1.02);
}

.dropzone.occupied {
  border-color: transparent;
  background: transparent;
}

.dropzone.swap {
  outline: 2px dashed #ffcc00;
  background: rgba(255, 204, 0, 0.08);
}

/* Drop Preview */
.drop-preview {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
  animation: fadeInScale 0.2s ease-out;
  z-index: 10;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preview-icon {
  font-size: 48px;
  color: rgba(0, 255, 120, 0.8);
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.preview-text {
  color: rgba(0, 255, 120, 0.9);
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Swap Indicator */
.swap-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
  animation: fadeInScale 0.2s ease-out;
}

/* .swap-icon {
  font-size: 64px;
  color: rgba(255, 165, 0, 0.9);
  text-shadow:
    0 0 20px rgba(255, 165, 0, 0.8),
    0 0 40px rgba(255, 165, 0, 0.4);
  animation: rotate-swap 1s ease-in-out infinite;
}

@keyframes rotate-swap {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
} */

/* Grid overlay pattern */
.timer-grid::before {
  content: '';
  position: absolute;
  inset: 80px 16px 16px 16px;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
  z-index: 0;
}

/* Vignette */
.timer-grid::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.5));
  z-index: 0;
}

.grid--visible .dropzone {
  opacity: 1;
}

.grid:not(.grid--visible) .dropzone {
  opacity: 0;
  pointer-events: none;
}

.grid--visible .dropzone:not(.occupied) {
    opacity: 0;
}


/* @media (max-width: 1080px) {
  .timer-grid {
    grid-template-columns: repeat(2, minmax(320px, 1fr));
  }
}

@media (max-width: 700px) {
  .timer-widget {
    font-size: 0.95em;
  }
  .timer-grid {
    grid-template-columns: 1fr;
  }
} */

.operator {
  color: var(--primary-color);
}
</style>