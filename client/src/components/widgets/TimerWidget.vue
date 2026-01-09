<script setup>
import { ref } from 'vue'
import { useTimerStore } from '@/stores/timer.store'
import CountdownTimer from '@/components/timers/CountdownTimer.vue'
import StopwatchTimer from '@/components/timers/StopwatchTimer.vue'

const props = defineProps({ widget: Object })
const store = useTimerStore()

const widgetEl = ref(null)
const isDraggable = ref(false)
const showPresets = ref(false)

const handleControlBarMouseDown = () => {
  isDraggable.value = true
}

const handleDragStart = (e) => {
  if (!isDraggable.value) {
    e.preventDefault()
    return
  }

  store.startDrag(props.widget.id)
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.widget.id)

  e.target.style.opacity = '0.5'
}

const handleDragEnd = (e) => {
  e.target.style.opacity = '1'
  isDraggable.value = false
  store.endDrag()
}

const handleNameUpdate = (e) => {
  store.updateWidgetName(props.widget.id, e.target.value)
}

const applyPreset = (preset) => {
  store.applyPresetToWidget(props.widget.id, preset.seconds)
  showPresets.value = false
}
</script>

<template>
  <div
    ref="widgetEl"
    class="timer-widget"
    :draggable="isDraggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Control Bar -->
    <div
      class="control-bar"
      @mousedown="handleControlBarMouseDown"
    >

      <button
        class="toggle-button"
        :disabled="widget.timer?.isActive"
        @click.stop="store.toggleTimerType(widget.id)"
        @mousedown.stop
        title="Toggle timer type"
      >
        {{ widget.type === 'countdown' ? '⏱' : '⏳' }}
      </button>

      <Transition name="slide-up">
        <div
          v-if="showPresets && widget.type === 'countdown'"
          class="preset-drawer"
          @mousedown.stop
        >
          <button
            v-for="preset in store.presets"
            :key="preset.id"
            class="preset-chip"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </button>

          <button class="preset-chip add">
            + Custom
          </button>
        </div>
      </Transition>


      <button class="save-button">💾</button>

      <button
        class="preset-button"
        @click.stop="showPresets = !showPresets"
        @mousedown.stop
        title="Presets"
      >
        ⚡
      </button>

      <!-- <input
        :value="widget.name"
        @input="handleNameUpdate"
        class="timer-name"
        placeholder="Timer name..."
        @click.stop
        @mousedown.stop
      /> -->

      <div class="drag-handle">
        ⣿
      </div>

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
      :widgetId="widget.id"
    />
  </div>
</template>

<style scoped>
.timer-widget {
  /* max-width: 450px; */
  margin: 0 auto;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(145deg, #0e0e0e, #000);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.06),
    0 12px 32px rgba(0,0,0,.7);
  transition:
    box-shadow .2s ease,
    transform .2s ease,
    opacity .2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  will-change: transform;
  /* aspect-ratio: 16 / 9; */
  /* max-width: 320px; */
}

.timer-widget[draggable="true"] {
  cursor: grab;
  transform: scale(1.02);
}

.timer-widget[draggable="true"]:active {
  cursor: grabbing;
}

.timer-widget[draggable="true"]:hover {
  transform: none;
}

.timer-widget:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.1),
    0 16px 40px rgba(0,0,0,.9);
}

.control-bar {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 8px;
  padding: 4px 6px;
  /* padding: 8px 12px; */
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px 12px 0 0;
  /* min-height: 40px; */
  cursor: grab;
}

.control-bar:active {
  cursor: grabbing;
}

.drag-handle {
  /* padding: 4px 8px; */
  padding: 0px 0 4px 0;

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

.timer-name {
  width: 100%;
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 6px 10px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all .2s;
  cursor: text;
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
  width: 20px;
  height: 20px;
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
  width: 20px;
  height: 20px;
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

.toggle-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.save-button {
  width: 20px;
  height: 20px;
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

.save-button:hover {
  opacity: 1;
  background: rgba(100, 150, 255, 0.3);
  transform: scale(1.1);
}

.save-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* -------------------------------
   Preset Button
-------------------------------- */
.preset-button {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 255, 120, 0.15);
  color: #00ff78;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.6;
  transition: all .2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preset-button:hover {
  opacity: 1;
  background: rgba(0, 255, 120, 0.3);
  transform: scale(1.1);
}

/* -------------------------------
   Preset Drawer
-------------------------------- */
.preset-drawer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  padding: 10px;
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;

  background: linear-gradient(
    to top,
    rgba(0,0,0,.95),
    rgba(0,0,0,.75)
  );
  border-top: 1px solid rgba(0, 255, 120, 0.4);
  z-index: 5;
}

.preset-chip {
  padding: 6px 12px;
  font-family: monospace;
  font-size: 12px;
  color: #00ff78;
  border: 1px solid rgba(0,255,120,.6);
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: all .15s ease;
}

.preset-chip:hover {
  background: rgba(0,255,120,.15);
  transform: translateY(-1px);
}

.preset-chip.add {
  color: #9ecbff;
  border-color: rgba(100,150,255,.5);
}

/* -------------------------------
   Slide Animation
-------------------------------- */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform .2s ease, opacity .2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

</style>