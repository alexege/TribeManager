<script setup>
  import { ref } from 'vue';
  const props = defineProps(['point'])
  const emit = defineEmits(['point-size'])

  const pointSize = ref(props.point.size || 5); // Default size

  const updatePreview = () => {
    // Additional logic can go here if needed
    emit('point-size', pointSize.value)
  };
  </script>

<template>
    <div class="point-size-selector">
      <!-- <h2>Point Size Selector</h2> -->

      <div class="point-container">

        <input
          type="range"
          min="5"
          max="25"
          step="1"
          v-model="pointSize"
          @input="updatePreview"
        />
        <p>{{ pointSize }} px</p>

      </div>


      <div class="point-preview">
        <div
          class="preview-point"
          :style="[{ width: pointSize + 'px', height: pointSize + 'px' },{ background: props.point.color}]"
        ></div>
      </div>

      <!-- <p>Size: {{ pointSize }} px</p> -->

    </div>
  </template>

  <style scoped>
  .point-container {
    display: flex;
    align-items: center;
  }

  .point-preview {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--void-black);
  }

  .point-container p {
    font-size: 10px;
    margin-left: 2px;
  }

  .point-size-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .preview-point {
    border-radius: 50%;
    /* margin-top: 20px; */
    outline: 1px solid black;
  }
  </style>
