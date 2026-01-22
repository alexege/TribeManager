<script setup>
import { ref, computed } from 'vue'
import { useTimerStore } from '@/stores/timer.store'

const props = defineProps({
  widgetId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'select'])
const store = useTimerStore()

const search = ref('')

/**
 * Placeholder image catalog
 * Replace later with real assets or API data
 */
const IMAGES = [
  { id: 1, label: 'Giganotosaurus',     src: '../../src/assets/dinos/silhouette/Giganotosaurus.png' },
  { id: 2, label: 'Allosaurus',         src: '../../src/assets/dinos/silhouette/Allosaurus.png' },
  { id: 3, label: 'Amargasaurus',       src: '../../src/assets/dinos/silhouette/Amargasaurus.png' },
  { id: 4, label: 'Ankylosaurus',       src: '../../src/assets/dinos/silhouette/Ankylosaurus.png' },
  { id: 5, label: 'Baryonyx',           src: '../../src/assets/dinos/silhouette/Baryonyx.png' },
  { id: 6, label: 'Brontosaurus',       src: '../../src/assets/dinos/silhouette/Brontosaurus.png' },
  { id: 7, label: 'Carnotaurus',        src: '../../src/assets/dinos/silhouette/Carnotaurus.png' },
  { id: 8, label: 'Compy',              src: '../../src/assets/dinos/silhouette/Compy.png' },
  { id: 9, label: 'Deinonychus',        src: '../../src/assets/dinos/silhouette/Deinonychus.png' },
  { id: 10, label: 'Dilophosaur',       src: '../../src/assets/dinos/silhouette/Dilophosaur.png' },
  { id: 11, label: 'Dinopithecus',      src: '../../src/assets/dinos/silhouette/Dinopithecus.png' },
  { id: 12, label: 'Diplodocus',        src: '../../src/assets/dinos/silhouette/Diplodocus.png' },
  { id: 13, label: 'Gallimimus',        src: '../../src/assets/dinos/silhouette/Gallimimus.png' },
  { id: 14, label: 'Iguanodon',         src: '../../src/assets/dinos/silhouette/Iguanodon.png' },
  { id: 15, label: 'Kentrosaurus',      src: '../../src/assets/dinos/silhouette/Kentrosaurus.png' },
  { id: 16, label: 'Megalosaurus',      src: '../../src/assets/dinos/silhouette/Megalosaurus.png' },
  { id: 17, label: 'Microraptor',       src: '../../src/assets/dinos/silhouette/Microraptor.png' },
  { id: 18, label: 'Morellatops',       src: '../../src/assets/dinos/silhouette/Morellatops.png' },
  { id: 19, label: 'Oviraptor',         src: '../../src/assets/dinos/silhouette/Oviraptor.png' },
  { id: 20, label: 'Pachyrhinosaurus',  src: '../../src/assets/dinos/silhouette/Pachyrhinosaurus.png' },
  { id: 21, label: 'Parasaur',          src: '../../src/assets/dinos/silhouette/Parasaur.png' },
  { id: 22, label: 'Pegomastax',        src: '../../src/assets/dinos/silhouette/Pegomastax.png' },
  { id: 23, label: 'Raptor',            src: '../../src/assets/dinos/silhouette/Raptor.png' },
  { id: 24, label: 'Rex',               src: '../../src/assets/dinos/silhouette/Rex.png' },
  { id: 25, label: 'Sinomacrops',       src: '../../src/assets/dinos/silhouette/Sinomacrops.png' },
  { id: 26, label: 'Spino',             src: '../../src/assets/dinos/silhouette/Spino.png' },
  { id: 27, label: 'Stegosaurus',       src: '../../src/assets/dinos/silhouette/Stegosaurus.png' },
  { id: 28, label: 'Therizinosaur',     src: '../../src/assets/dinos/silhouette/Therizinosaur.png' },
  { id: 29, label: 'Trike',             src: '../../src/assets/dinos/silhouette/Trike.png' },
  { id: 30, label: 'Troodon',           src: '../../src/assets/dinos/silhouette/Troodon.png' },
  { id: 31, label: 'Yutyrannus',        src: '../../src/assets/dinos/silhouette/Yutyrannus.png' },
]

const filteredImages = computed(() => {
  if (!search.value) return IMAGES
  return IMAGES.filter(img =>
    img.label.toLowerCase().includes(search.value.toLowerCase())
  )
})

function selectImage(src) {
  // If widgetId is provided, update the widget image in the store
  if (props.widgetId) {
    store.updateWidgetImage(props.widgetId, src)
    emit('close')
  } else {
    // Otherwise, just emit the selection (for preset modal)
    emit('select', src)
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <header>
        <h3>Select an Image</h3>
        <button @click="emit('close')">✕</button>
      </header>

      <input
        v-model="search"
        type="text"
        placeholder="Search images…"
        class="search-input"
      />

      <div class="image-grid">
        <button
          v-for="img in filteredImages"
          :key="img.id"
          class="image-item"
          @click="selectImage(img.src)"
        >
          <img :src="img.src" :alt="img.label" />
          <span>{{ img.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: grid;
  place-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.modal {
  background: linear-gradient(145deg, #0e0e0e, #000);
  width: 70vw;
  max-width: 800px;
  max-height: 80vh;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.08),
    0 20px 50px rgba(0,0,0,.9);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

header h3 {
  color: white;
  font-size: 18px;
  margin: 0;
}

header button {
  background: transparent;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
  padding: 4px 8px;
}

header button:hover {
  opacity: 1;
}

.search-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: rgba(0, 255, 120, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding: 8px;
  max-height: 60vh;
}

.image-grid::-webkit-scrollbar {
  width: 8px;
}

.image-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.image-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.image-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.image-item {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  text-align: center;
  padding: 12px;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: rgba(0, 255, 120, 0.5);
  background: rgba(0, 255, 120, 0.05);
  transform: translateY(-2px);
}

.image-item img {
  width: 100%;
  height: auto;
  max-height: 60px;
  object-fit: contain;
  transition: transform 0.15s ease;
}

.image-item:hover img {
  transform: scale(1.1);
}

.image-item span {
  font-size: 0.7rem;
  opacity: 0.7;
  color: white;
  line-height: 1.2;
  word-break: break-word;
}

.image-item:hover span {
  opacity: 1;
  color: #00ff78;
}
</style>