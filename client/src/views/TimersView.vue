<script setup>
import TimerWidget from '@/components/widgets/TimerWidget.vue'
import { useTimerStore } from '@/stores/timer.store'

const store = useTimerStore()

const handleDragOver = (e, zoneId) => {
  e.preventDefault()
  store.setHoveredZone(zoneId)
}

const handleDragLeave = () => {
  store.setHoveredZone(null)
}

const handleDrop = (e, zoneId) => {
  e.preventDefault()
  store.endDrag()
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
        <span class="label">Rows:</span>
        <button @click="store.decreaseRows" :disabled="store.gridRows <= 1">−</button>
        <span class="count">{{ store.gridRows }}</span>
        <button @click="store.increaseRows" :disabled="store.gridRows >= 6">+</button>

        <span class="label">Cols:</span>
        <button @click="store.decreaseCols" :disabled="store.gridCols <= 1">−</button>
        <span class="count">{{ store.gridCols }}</span>
        <button @click="store.increaseCols" :disabled="store.gridCols >= 8">+</button>
      </div>
    </div>

    <div
      class="timer-grid"
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
          occupied: zone.occupied,
          'swap-target': store.widgets.find(w => w.zoneId === zone.id && w.id === store.swapTargetWidgetId)
        }"
        @dragover="handleDragOver($event, zone.id)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, zone.id)"
      >
        <div
          v-if="store.isDragging && store.hoveredZoneId === zone.id && !zone.occupied"
          class="drop-preview"
        >
          <div class="preview-icon">↓</div>
          <div class="preview-text">Drop here</div>
        </div>

        <div
          v-if="store.swapTargetWidgetId && store.widgets.find(w => w.zoneId === zone.id && w.id === store.swapTargetWidgetId)"
          class="swap-indicator"
        >
          <div class="swap-icon">⇄</div>
        </div>

        <TimerWidget
          v-if="store.widgets.find(w => w.zoneId === zone.id)"
          :widget="store.widgets.find(w => w.zoneId === zone.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.timers-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #14161f, #0b0c12);
  position: relative;
}

/* Toolbar */
.toolbar {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
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
  height: 100%;
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr);
  gap: 16px;
  padding: 80px 16px 16px 16px;
  box-sizing: border-box;
}

/* Dropzones */
.dropzone {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
  min-height: 160px;
}

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

.dropzone.swap-target {
  border-color: rgba(255, 165, 0, 0.8) !important;
  background: rgba(255, 165, 0, 0.1) !important;
  animation: pulse-swap 0.6s ease-in-out infinite;
}

@keyframes pulse-swap {
  0%, 100% {
    box-shadow: inset 0 0 20px rgba(255, 165, 0, 0.3);
  }
  50% {
    box-shadow: inset 0 0 30px rgba(255, 165, 0, 0.5);
  }
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

.swap-icon {
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
}

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
</style>