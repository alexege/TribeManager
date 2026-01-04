<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isChecked = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const toggleId = `toggle-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <div class="theme-switch-wrapper">
    <label class="theme-switch" :for="toggleId">
      <input
        type="checkbox"
        :id="toggleId"
        :checked="isChecked"
        @change="isChecked = $event.target.checked"
      />
      <div class="slider round"></div>
    </label>
  </div>
</template>

<style scoped>
/*Simple css to style it like a toggle switch*/
.theme-switch-wrapper {
    display: flex;
    align-items: center;
}

.theme-switch-wrapper em {
    margin-left: 10px;
    font-size: 1rem;
}

.theme-switch {
    display: inline-block;
    /* height: 34px; */
    height: 15px;
    position: relative;
    /* width: 60px; */
    width: 25px;
}

.theme-switch input {
    display: none;
}

.slider {
    background-color: var(--secondary-bg-color);
    bottom: 0;
    cursor: pointer;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: 0.4s;
}

.slider:before {
    background-color: var(--text-primary);
    bottom: 4px;
    content: '';
    top: 1px;
    left: 1px;
    position: absolute;
    width: 13px;
    height: 13px;

    -webkit-transition: -webkit-transform 0.125s ease-out;
    transition: -webkit-transform 0.125s ease-out;
    transition: transform 0.125s ease-out;
    transition:
        transform 0.125s ease-out,
        -webkit-transform 0.125s ease-out;
}

input:checked + .slider {
    background-color: var(--primary-color);
}

input:checked + .slider:before {
    transform: translateX(10px);
}

.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>
