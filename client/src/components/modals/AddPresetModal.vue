<script setup>
import { ref, computed, watch } from 'vue'
import { useTimerStore } from '@/stores/timer.store'
import ImagePickerModal from '@/components/modals/ImagePickerModal.vue'

const emit = defineEmits(['close'])
const timerStore = useTimerStore()

const props = defineProps({
    preset: {
        type: Object,
        default: null
    }
})

const isEditMode = computed(() => !!props.preset)

/* ───────────────
   Time State
──────────────── */
const days = ref(0)
const hours = ref(0)
const minutes = ref(5)
const seconds = ref(0)

/* ───────────────
   Preset Meta
──────────────── */
const label = ref('')
const icon = ref(null)

/* ───────────────
   Image Picker
──────────────── */
const showImagePicker = ref(false)

/* ───────────────
   Normalize Inputs
──────────────── */
watch([seconds, minutes, hours], () => {
  if (seconds.value >= 60) {
    minutes.value += Math.floor(seconds.value / 60)
    seconds.value %= 60
  }
  if (minutes.value >= 60) {
    hours.value += Math.floor(minutes.value / 60)
    minutes.value %= 60
  }
  if (hours.value >= 24) {
    days.value += Math.floor(hours.value / 24)
    hours.value %= 24
  }
})

/* ───────────────
   Duration
──────────────── */
const totalSeconds = computed(() =>
  days.value * 86400 +
  hours.value * 3600 +
  minutes.value * 60 +
  seconds.value
)

/* ───────────────
   Label
──────────────── */
const finalLabel = computed(() => {
  if (label.value) return label.value
  const parts = []
  if (days.value) parts.push(`${days.value}d`)
  if (hours.value) parts.push(`${hours.value}h`)
  if (minutes.value) parts.push(`${minutes.value}m`)
  if (seconds.value) parts.push(`${seconds.value}s`)
  return parts.join(' ') || 'Preset'
})

/* ───────────────
   Save
──────────────── */
const save = () => {
  if (totalSeconds.value <= 0) return

  if (isEditMode.value) {
    timerStore.updatePreset(props.preset.id, {
      label: finalLabel.value,
      seconds: totalSeconds.value,
      icon: icon.value,
    });
  } else {
    timerStore.addPreset({
      label: finalLabel.value,
      seconds: totalSeconds.value,
      icon: icon.value,
    });
  }

  emit('close')
}

/* ───────────────
   Watch for preset changes
──────────────── */
watch(
  () => props.preset,
  (preset) => {
    if (!preset) {
      // Reset to defaults when creating new
      days.value = 0
      hours.value = 0
      minutes.value = 5
      seconds.value = 0
      label.value = ''
      icon.value = null
      return
    }

    // Load preset data for editing
    label.value = preset.label || ''
    icon.value = preset.icon || null

    let remaining = preset.seconds
    days.value = Math.floor(remaining / 86400)
    remaining %= 86400
    hours.value = Math.floor(remaining / 3600)
    remaining %= 3600
    minutes.value = Math.floor(remaining / 60)
    seconds.value = remaining % 60
  },
  { immediate: true }
)

/* ───────────────
   Image Selection - Fixed to accept string
──────────────── */
const onSelectImage = (imageSrc) => {
  icon.value = imageSrc
  showImagePicker.value = false
}
</script>

<template>
  <div class="preset-modal-backdrop" @click.self="emit('close')">
    <div class="preset-modal">
      <!-- Header -->
      <header class="preset-header">
        <h3>{{ isEditMode ? 'Edit Preset' : 'Create Preset' }}</h3>
        <button class="close" @click="emit('close')">✕</button>
      </header>

      <!-- Icon -->
      <div class="timer-icon" @click="showImagePicker = true">
        <img
          :src="icon || 'src/assets/timers/Stopwatch.png'"
          alt="Preset Icon"
        />
      </div>

      <!-- Time Input -->
      <div class="time-input">
        <div class="input-control">
          <label>days</label>
          <div class="input-wrapper">
            <input type="number" v-model.number="days" min="0" />
            <span>:</span>
          </div>
        </div>
        <div class="input-control">
          <label>hrs</label>
          <div class="input-wrapper">
            <input type="number" v-model.number="hours" min="0" />
            <span>:</span>
          </div>
        </div>
        <div class="input-control">
          <label>mins</label>
          <div class="input-wrapper">
            <input type="number" v-model.number="minutes" min="0" />
            <span>:</span>
          </div>
        </div>
        <div class="input-control">
          <label>secs</label>
          <input type="number" v-model.number="seconds" min="0" />
        </div>
      </div>

      <div class="preset-body">
        <div class="field full">
          <label>Label (optional)</label>
          <input v-model="label" :placeholder="finalLabel" />
        </div>
      </div>

      <footer class="preset-actions">
        <button class="ghost" @click="emit('close')">Cancel</button>
        <button class="primary" @click="save" :disabled="totalSeconds <= 0">
          {{ isEditMode ? 'Update Preset' : 'Save Preset' }}
        </button>
      </footer>
    </div>

    <!-- Image Picker -->
    <ImagePickerModal
      v-if="showImagePicker"
      @select="onSelectImage"
      @close="showImagePicker = false"
    />
  </div>
</template>

<style scoped>
/* Input Styles */
.time-input {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.input-control {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-control input {
  font-size: 1em;
  width: 50px;
  background: #222;
  color: white;
  border: 1px solid #444;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
}

.input-control label {
  font-size: 0.6rem;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 4px;
}

.input-control .input-wrapper {
  display: flex;
  align-items: center;
}

.input-control .input-wrapper span {
  padding: 0 3px;
  color: #888;
}

.timer-icon {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1em 0;
}

.timer-icon img {
  width: 100px;
  height: 100px;
  outline: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.2s;
}

.timer-icon:hover img {
  outline-color: rgba(0, 255, 120, 0.5);
  transform: scale(1.05);
}

/* Backdrop */
.preset-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* Modal Shell */
.preset-modal {
  width: 100%;
  max-width: 360px;
  background: linear-gradient(145deg, #0e0e0e, #000);
  border-radius: 14px;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.08),
    0 20px 50px rgba(0,0,0,.9);
  overflow: hidden;
  color: white;
  display: flex;
  flex-direction: column;
}

/* Header */
.preset-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
}

.preset-header h3 {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: .4px;
  opacity: .85;
}

.preset-header .close {
  border: none;
  background: transparent;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  opacity: .6;
  transition: opacity .15s ease;
}

.preset-header .close:hover {
  opacity: 1;
}

/* Body */
.preset-body {
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 11px;
  letter-spacing: .3px;
  opacity: .6;
}

/* Inputs */
.field input {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
  padding: 8px 10px;
  color: white;
  font-size: 13px;
  outline: none;
  transition: all .15s ease;
}

.field input::placeholder {
  color: rgba(255,255,255,.35);
}

.field input:hover {
  background: rgba(255,255,255,.08);
}

.field input:focus {
  border-color: rgba(0,255,120,.6);
  box-shadow: 0 0 0 2px rgba(0,255,120,.15);
  background: rgba(255,255,255,.1);
}

/* Footer Actions */
.preset-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(255,255,255,.08);
}

/* Buttons */
button {
  font-size: 12px;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  border: none;
  transition: all .15s ease;
}

button.ghost {
  background: transparent;
  color: #aaa;
}

button.ghost:hover {
  background: rgba(255,255,255,.08);
}

button.primary {
  background: rgba(0,255,120,.15);
  color: #00ff78;
  box-shadow: inset 0 0 0 1px rgba(0,255,120,.5);
}

button.primary:hover:not(:disabled) {
  background: rgba(0,255,120,.3);
  transform: translateY(-1px);
}

button.primary:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>