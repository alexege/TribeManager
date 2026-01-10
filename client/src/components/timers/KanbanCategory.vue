<script setup>
import { ref, computed } from 'vue'
import { useTimerStore } from '@/stores/timer.store'
import TimerWidget from '@/components/widgets/TimerWidget.vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const store = useTimerStore()
const isEditingName = ref(false)
const editedName = ref(props.category.name)
const showAddMenu = ref(false)
const categoryEl = ref(null)
const isDraggingCategory = ref(false)
const dragHandleEl = ref(null)
const isDragHandleActive = ref(false)

const widgets = computed(() => {
  return store.getWidgetsByCategory(props.category.id)
})

const handleNameEdit = () => {
  isEditingName.value = true
  editedName.value = props.category.name
}

const handleNameSave = () => {
  if (editedName.value.trim()) {
    store.updateCategory(props.category.id, { name: editedName.value.trim() })
  }
  isEditingName.value = false
}

const handleDeleteCategory = () => {
  if (widgets.value.length > 0) {
    const confirmed = confirm(
      `Delete "${props.category.name}" and all ${widgets.value.length} timer(s)?`
    )
    if (!confirmed) return
  }
  store.deleteCategory(props.category.id)
}

const handleAddCountdown = () => {
  store.addCountdownToCategory(props.category.id)
  showAddMenu.value = false
}

const handleAddStopwatch = () => {
  store.addStopwatchToCategory(props.category.id)
  showAddMenu.value = false
}

// Drag and Drop handlers for the category (drop zone)
const isDragOver = ref(false)

const handleDragOver = (e) => {
  // Only handle widget drops, not category drops
  if (!e.dataTransfer.types.includes('application/category')) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    isDragOver.value = true
  }
}

const handleDragLeave = (e) => {
  // Only set to false if we're leaving the category entirely
  if (e.currentTarget === e.target) {
    isDragOver.value = false
  }
}

const handleDrop = (e) => {
  // Only handle widget drops
  if (e.dataTransfer.types.includes('application/category')) {
    return
  }

  e.preventDefault()
  isDragOver.value = false

  const widgetId = e.dataTransfer.getData('text/plain')
  if (!widgetId) return

  // Get the widget being dragged
  const draggedWidget = store.widgets.find(w => w.id === widgetId)
  if (!draggedWidget) return

  // If dropping into the same category, add to end
  if (draggedWidget.categoryId === props.category.id) return

  // Move to this category at the end
  const newOrder = widgets.value.length
  store.moveWidget(widgetId, props.category.id, newOrder)
}

// Widget reordering within category
const handleWidgetDragOver = (e, targetWidget) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleWidgetDrop = (e, targetWidget) => {
  e.preventDefault()
  e.stopPropagation()

  const widgetId = e.dataTransfer.getData('text/plain')
  if (!widgetId || widgetId === targetWidget.id) return

  store.moveWidget(widgetId, props.category.id, targetWidget.order)
}

// Category drag and drop handlers
const handleCategoryDragStart = (e) => {
  isDraggingCategory.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('application/category', props.category.id)

  // Visual feedback on the entire category
  setTimeout(() => {
    if (categoryEl.value) {
      categoryEl.value.classList.add('dragging')
    }
  }, 0)
}

const handleCategoryDragEnd = (e) => {
  isDraggingCategory.value = false

  if (categoryEl.value) {
    categoryEl.value.classList.remove('dragging')
  }
}
</script>

<template>
  <div
    ref="categoryEl"
    class="kanban-category"
    :class="{ 'drag-over': isDragOver }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Category Header -->
    <div class="category-header">
      <div class="category-title">
        <span
          ref="dragHandleEl"
          class="drag-handle"
          title="Drag to reorder category"
          draggable="true"
          @dragstart="handleCategoryDragStart"
          @dragend="handleCategoryDragEnd"
        >
          ⣿
        </span>
        <input
          v-if="isEditingName"
          v-model="editedName"
          @blur="handleNameSave"
          @keyup.enter="handleNameSave"
          @keyup.esc="isEditingName = false"
          class="name-edit-input"
          autofocus
        />
        <h3 v-else @dblclick="handleNameEdit" class="category-name">
          {{ category.name }}
          <span class="widget-count">{{ widgets.length }}</span>
        </h3>
      </div>

      <div class="category-actions">
        <button @click="handleNameEdit" class="action-button edit" title="Edit name">
          ✏️
        </button>
        <button @click="handleDeleteCategory" class="action-button delete" title="Delete category">
          🗑️
        </button>
      </div>
    </div>

    <!-- Widgets Container -->
    <div class="widgets-container">
      <div
        v-for="widget in widgets"
        :key="widget.id"
        class="widget-wrapper"
        @dragover.prevent.stop="(e) => handleWidgetDragOver(e, widget)"
        @drop.prevent.stop="(e) => handleWidgetDrop(e, widget)"
      >
        <TimerWidget :widget="widget" />
      </div>

      <!-- Empty State -->
      <div v-if="widgets.length === 0" class="empty-category">
        <p>No timers yet</p>
        <p class="empty-hint">Add your first timer below</p>
      </div>
    </div>

    <!-- Add Timer Button -->
    <div class="add-timer-section">
      <button
        v-if="!showAddMenu"
        @click="showAddMenu = true"
        class="add-timer-button"
      >
        <span class="plus">+</span> Add Timer
      </button>

      <div v-else class="add-menu">
        <button @click="handleAddCountdown" class="menu-option countdown">
          ⏱ Countdown
        </button>
        <button @click="handleAddStopwatch" class="menu-option stopwatch">
          ⏳ Stopwatch
        </button>
        <button @click="showAddMenu = false" class="menu-option cancel">
          ✕ Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-category {
  min-width: 320px;
  max-width: 400px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 140px);
  transition: all 0.2s;
}

.kanban-category.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  box-shadow: 0 10px 30px rgba(0, 255, 120, 0.3);
  border-color: rgba(0, 255, 120, 0.5);
}

.kanban-category.drag-over {
  background: rgba(0, 255, 120, 0.05);
  border-color: rgba(0, 255, 120, 0.3);
  transform: scale(1.01);
}

/* Category Header */
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: default;
}

.category-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
  cursor: grab;
  user-select: none;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.drag-handle:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
}

.drag-handle:active {
  cursor: grabbing;
  background: rgba(255, 255, 255, 0.12);
  transform: scale(0.95);
}

.category-name {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name:hover {
  color: #00ff78;
}

.widget-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.name-edit-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 120, 0.5);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  outline: none;
}

.category-actions {
  display: flex;
  gap: 6px;
}

.action-button {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.action-button.delete:hover {
  background: rgba(255, 50, 50, 0.2);
}

/* Widgets Container */
.widgets-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px;
  min-height: 200px;
}

.widgets-container::-webkit-scrollbar {
  width: 6px;
}

.widgets-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.widgets-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.widget-wrapper {
  transition: all 0.2s;
}

.widget-wrapper:hover {
  transform: translateX(2px);
}

/* Empty State */
.empty-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  flex: 1;
}

.empty-category p {
  margin: 5px 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

/* Add Timer Section */
.add-timer-section {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.add-timer-button {
  width: 100%;
  padding: 12px;
  background: rgba(0, 255, 120, 0.1);
  border: 1px solid rgba(0, 255, 120, 0.3);
  border-radius: 8px;
  color: #00ff78;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-timer-button:hover {
  background: rgba(0, 255, 120, 0.2);
  transform: translateY(-1px);
}

.plus {
  font-size: 18px;
  font-weight: bold;
}

/* Add Menu */
.add-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-option {
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;
}

.menu-option.countdown {
  background: rgba(100, 150, 255, 0.15);
  color: #9ecbff;
  border: 1px solid rgba(100, 150, 255, 0.3);
}

.menu-option.countdown:hover {
  background: rgba(100, 150, 255, 0.25);
}

.menu-option.stopwatch {
  background: rgba(255, 200, 0, 0.15);
  color: #ffc800;
  border: 1px solid rgba(255, 200, 0, 0.3);
}

.menu-option.stopwatch:hover {
  background: rgba(255, 200, 0, 0.25);
}

.menu-option.cancel {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-option.cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>