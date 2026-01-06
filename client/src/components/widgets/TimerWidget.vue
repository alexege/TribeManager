<script setup>
import { useTimerStore } from '@/stores/timer.store'
import CountdownTimer from '@/components/timers/CountdownTimer.vue'
import StopwatchTimer from '@/components/timers/StopwatchTimer.vue'

const props = defineProps({ widget: Object })
const store = useTimerStore()

const handleDragStart = (e) => {
  store.startDrag(props.widget.id)
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.widget.id)

  // Optional: Create a custom drag image
  e.target.style.opacity = '0.5'
}

const handleDragEnd = (e) => {
  e.target.style.opacity = '1'
  store.endDrag()
}
</script>

<template>
  <div
    class="timer-widget"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Control Bar -->
    <div class="control-bar">
      <div class="drag-handle">
        ⣿
      </div>

      <input
        v-model="widget.name"
        class="timer-name"
        placeholder="Timer name..."
        @click.stop
        @mousedown.stop
      />

      <button
        class="toggle-button"
        :disabled="widget.timer?.isActive"
        @click.stop="store.toggleTimerType(widget.id)"
        @mousedown.stop
        title="Toggle timer type"
      >
        {{ widget.type === 'countdown' ? '⏱' : '⏳' }}
      </button>

      <button
        class="delete-button"
        @click.stop="store.removeWidget(widget.id)"
        @mousedown.stop
        title="Delete timer"
      >
        ✕
      </button>
    </div>

    <!-- Timer Component -->
    <component
      :is="widget.type === 'countdown' ? CountdownTimer : StopwatchTimer"
      :timer="widget.timer"
    />
  </div>
</template>

<style scoped>
.timer-widget {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(145deg, #0e0e0e, #000);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.06),
    0 12px 32px rgba(0,0,0,.7);
  transition: box-shadow .2s ease, transform .2s ease;
  display: flex;
  flex-direction: column;
  cursor: grab;
  position: relative;
  z-index: 1;
}

.timer-widget[draggable="true"]:active {
  opacity: 0.5;
  cursor: grabbing;
}

.timer-widget:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.1),
    0 16px 40px rgba(0,0,0,.9);
}

.timer-widget:active {
  cursor: grabbing;
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px 12px 0 0;
  min-height: 40px;
}

.drag-handle {
  cursor: grab;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.08);
  color: #ccc;
  font-size: 14px;
  user-select: none;
  opacity: 0.6;
  transition: all .2s;
  flex-shrink: 0;
}

.drag-handle:hover {
  opacity: 1;
  background: rgba(255,255,255,0.12);
}

.drag-handle:active {
  cursor: grabbing;
}

.timer-name {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 6px 10px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all .2s;
}

.timer-name::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.timer-name:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.timer-name:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 255, 120, 0.5);
  box-shadow: 0 0 0 2px rgba(0, 255, 120, 0.1);
}

.delete-button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 50, 50, 0.15);
  color: #ff6b6b;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: all .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.delete-button:hover {
  opacity: 1;
  background: rgba(255, 50, 50, 0.3);
  transform: scale(1.1);
}

.toggle-button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(100, 150, 255, 0.15);
  color: #9ecbff;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.6;
  transition: all .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.toggle-button:hover {
  opacity: 1;
  background: rgba(100, 150, 255, 0.3);
  transform: scale(1.1);
}
</style>