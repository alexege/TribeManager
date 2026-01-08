<script setup>
import { ref, nextTick, watch } from 'vue'
import ToggleSwitch from '@/components/inputs/ToggleSwitch.vue'
import TimerWidget from '@/components/widgets/TimerWidget.vue'
import { useTimerStore } from '@/stores/timer.store'

const store = useTimerStore()

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
const handleDragOver = (e, zoneId) => {
  e.preventDefault()
  store.setHoveredZone(zoneId)
}

const handleDragLeave = () => {
  store.setHoveredZone(null)
}

const handleDrop = async (e) => {
  e.preventDefault()

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

</script>

<template>
  <div class="timers-view">
    <div class="toolbar">
      <div class="toolbar-section">
        <button @click="store.addCountdown">+ Countdown</button>
        <button @click="store.addStopwatch">+ Stopwatch</button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-section grid-controls">
        <Transition name="collapse">
          <span v-if="store.showGrid">
            <span class="label">Rows:</span>
            <button @click="store.decreaseRows" :disabled="store.gridRows <= 1">−</button>
            <span class="count">{{ store.gridRows }}</span>
            <button @click="store.increaseRows" :disabled="store.gridRows >= 6">+</button>

            <span class="label">Cols:</span>
            <button @click="store.decreaseCols" :disabled="store.gridCols <= 1">−</button>
            <span class="count">{{ store.gridCols }}</span>
            <button @click="store.increaseCols" :disabled="store.gridCols >= 8">+</button>
          </span>
        </Transition>

        <ToggleSwitch v-model="store.showGrid"/>
      </div>
    </div>

    <div
      class="timer-grid"
      :class="{'grid--visible': !store.showGrid}"
      :style="{
        '--grid-cols': store.gridCols,
        '--grid-rows': store.gridRows
      }"
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
  /* width: 100%; */
  margin: 0 auto;
  height: 100%;
  text-align: center;
  /* height: 100vh; */
  /* overflow: hidden; */
  background: linear-gradient(135deg, #14161f, #0b0c12);
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
  background: rgba(0, 0, 0, 0.75);
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

.grid-controls .count {
  color: white;
  font-size: 0.9em;
  min-width: 1.5em;
  text-align: center;
  font-weight: 600;
}

/* Grid Layout */
.timer-grid {
  width: 100%;
  /* min-width: 80vw; */
  /* height: 100%; */
  display: grid;
  /* grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr); */
  grid-template-columns: repeat(var(--grid-cols), minmax(100px, max-content));
  grid-template-rows: repeat(var(--grid-rows), minmax(100px, max-content));
  /* grid-auto-rows: max-content; */
  justify-content: center;
  align-content: start;
  gap: .5em;
  padding: 80px 16px 16px 16px;
  box-sizing: border-box;
}

/* Dropzones */
.dropzone {
  min-width: 320px;
  min-height: 200px;

  height: 100%;
  max-height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
  display: flex;
  position: relative;
}

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

/* =========================
   Collapse transition
========================= */

.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-width 240ms cubic-bezier(.22,1,.36,1),
    opacity 160ms ease,
    transform 240ms cubic-bezier(.22,1,.36,1);
  overflow: hidden;
  white-space: nowrap;
}

.collapse-enter-from,
.collapse-leave-to {
  max-width: 0;
  opacity: 0;
  transform: translateX(-6px) scale(0.95);
}

.collapse-enter-to,
.collapse-leave-from {
  max-width: 400px; /* safely larger than content */
  opacity: 1;
  transform: translateX(0) scale(1);
}

.collapse-enter-active {
  transition-delay: 40ms;
}

.collapse-leave-active {
  transition-delay: 180ms;
}

</style>