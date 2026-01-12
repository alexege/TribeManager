<script setup>
import { ref, computed } from 'vue'
import { useTimerStore } from '@/stores/timer.store'

const props = defineProps({
  widgetId: String
})

const emit = defineEmits(['close'])
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
  store.updateWidgetImage(props.widgetId, src)
  emit('close')
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
          <img :src="img.src" />
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
    background: rgba(255, 255, 255, 0.03);
    display: grid;
    place-items: center;
    z-index: 9999;
}

.modal {
  background: var(--secondary-bg-color);
  width: 70vw;
  max-height: 80vh;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  outline: none;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding: 1em;
}

.image-item {
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: center;
  outline: 1px solid white;
}

.image-item img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.15s ease;
}

.image-item:hover img {
  transform: scale(1.08);
}

.image-item span {
  font-size: 0.75rem;
  opacity: 0.8;
  color: var(--text-primary);
}


</style>