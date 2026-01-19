<script setup>
import { ref, computed } from 'vue'
import { useTimerStore } from '@/stores/timer.store'
import KanbanCategory from '@/components/timers/KanbanCategory.vue'

const store = useTimerStore()
const showAddCategory = ref(false)
const newCategoryName = ref('')
const boardContentEl = ref(null)
const draggedOverCategoryId = ref(null)

const sortedCategories = computed(() => {
  // Safety check: ensure categories is an array
  const categories = Array.isArray(store.categories) ? store.categories : []
  return [...categories].sort((a, b) => a.order - b.order)
})

const handleAddCategory = () => {
  if (newCategoryName.value.trim()) {
    store.addCategory(newCategoryName.value.trim())
    newCategoryName.value = ''
    showAddCategory.value = false
  }
}

const handleSyncToDatabase = async () => {
  try {
    await store.syncToDatabase()
    console.log('Synced to database successfully')
  } catch (error) {
    console.error('Failed to sync:', error)
  }
}

// Debug helper - remove after testing
const clearStorage = () => {
  if (confirm('Clear all local storage? This will delete all categories and timers.')) {
    localStorage.removeItem('timer-kanban-state')
    localStorage.removeItem('timer-widgets-state')
    location.reload()
  }
}

// Category drag and drop handlers
const handleCategoryDragOver = (e, category) => {
  e.preventDefault()

  // Only handle category drags, not widget drags
  if (e.dataTransfer.types.includes('application/category')) {
    e.dataTransfer.dropEffect = 'move'
    draggedOverCategoryId.value = category.id
  }
}

const handleCategoryDragLeave = (e, category) => {
  if (draggedOverCategoryId.value === category.id) {
    draggedOverCategoryId.value = null
  }
}

const handleCategoryDrop = (e, targetCategory) => {
  e.preventDefault()

  const draggedCategoryId = e.dataTransfer.getData('application/category')
  if (!draggedCategoryId || draggedCategoryId === targetCategory.id) {
    draggedOverCategoryId.value = null
    return
  }

  const draggedCategory = store.categories.find(c => c.id === draggedCategoryId)
  if (!draggedCategory) return

  // Reorder categories
  const newOrder = [...store.categories]
    .sort((a, b) => a.order - b.order)
    .filter(c => c.id !== draggedCategoryId)

  const targetIndex = newOrder.findIndex(c => c.id === targetCategory.id)
  newOrder.splice(targetIndex, 0, draggedCategory)

  // Update order values
  store.reorderCategories(newOrder.map(c => c.id))

  draggedOverCategoryId.value = null
}
</script>

<template>
  <div class="kanban-board">
    <!-- <div class="board-header">
      <h1>Timer Kanban Board</h1>
      <div class="header-actions">
        <button @click="handleSyncToDatabase" class="sync-button">
          💾 Save to Database
        </button>
        <button @click="clearStorage" class="clear-button" title="Clear local storage">
          🗑️ Clear All
        </button>
      </div>
    </div> -->

    <!-- Empty state -->
    <div v-if="sortedCategories.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📋</div>
        <h2>Get Started</h2>
        <p>Create your first category to organize your timers</p>
        <button @click="showAddCategory = true" class="create-first-button">
          Create First Category
        </button>
      </div>
    </div>

    <!-- Kanban columns -->
    <div v-else ref="boardContentEl" class="board-content">
      <div
        v-for="category in sortedCategories"
        :key="category.id"
        class="category-wrapper"
        :class="{ 'drag-over-category': draggedOverCategoryId === category.id }"
        @dragover="(e) => handleCategoryDragOver(e, category)"
        @dragleave="(e) => handleCategoryDragLeave(e, category)"
        @drop="(e) => handleCategoryDrop(e, category)"
      >
        <KanbanCategory :category="category" />
      </div>

      <!-- Add Category Column -->
      <div class="add-category-column">
        <button
          v-if="!showAddCategory"
          @click="showAddCategory = true"
          class="add-category-trigger"
        >
          <span class="plus-icon">+</span>
          Add Category
        </button>

        <div v-else class="add-category-form">
          <input
            v-model="newCategoryName"
            @keyup.enter="handleAddCategory"
            @keyup.esc="showAddCategory = false"
            placeholder="Category name..."
            class="category-name-input"
            autofocus
          />
          <div class="form-actions">
            <button @click="handleAddCategory" class="confirm-button">
              ✓
            </button>
            <button @click="showAddCategory = false; newCategoryName = ''" class="cancel-button">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for adding first category -->
    <div v-if="showAddCategory && sortedCategories.length === 0" class="modal-overlay" @click="showAddCategory = false">
      <div class="modal-content" @click.stop>
        <h3>Create Your First Category</h3>
        <input
          v-model="newCategoryName"
          @keyup.enter="handleAddCategory"
          placeholder="e.g., Work, Personal, Projects..."
          class="modal-input"
          autofocus
        />
        <div class="modal-actions">
          <button @click="handleAddCategory" class="modal-confirm">Create</button>
          <button @click="showAddCategory = false; newCategoryName = ''" class="modal-cancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  /* min-height: 100vh; */
  width: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 10px;
}

/* .board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.board-header h1 {
  color: white;
  font-size: 28px;
  margin: 0;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.sync-button,
.clear-button {
  padding: 10px 20px;
  border: 1px solid;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.sync-button {
  background: rgba(0, 255, 120, 0.15);
  color: #00ff78;
  border-color: rgba(0, 255, 120, 0.3);
}

.sync-button:hover {
  background: rgba(0, 255, 120, 0.25);
  transform: translateY(-1px);
}

.clear-button {
  background: rgba(255, 50, 50, 0.15);
  color: #ff6b6b;
  border-color: rgba(255, 50, 50, 0.3);
}

.clear-button:hover {
  background: rgba(255, 50, 50, 0.25);
  transform: translateY(-1px);
} */

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.empty-content {
  text-align: center;
  color: white;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-content h2 {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 600;
}

.empty-content p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
}

.create-first-button {
  padding: 15px 30px;
  background: rgba(0, 255, 120, 0.2);
  color: #00ff78;
  border: 2px solid rgba(0, 255, 120, 0.5);
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.create-first-button:hover {
  background: rgba(0, 255, 120, 0.3);
  transform: scale(1.05);
}

/* Board Content */
.board-content {
  display: flex;
  height: 100%;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
  align-items: flex-start;
}

.category-wrapper {
  position: relative;
  transition: all 0.2s;
}

.category-wrapper.drag-over-category::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #00ff78;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(0, 255, 120, 0.5);
}

.category-wrapper.drag-over-category {
  transform: translateX(10px);
}

.board-content::-webkit-scrollbar {
  height: 10px;
}

.board-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.board-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.board-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Add Category Column */
.add-category-column {
  min-width: 320px;
  flex-shrink: 0;
}

.add-category-trigger {
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.add-category-trigger:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 255, 120, 0.4);
  color: #00ff78;
}

.plus-icon {
  font-size: 24px;
  font-weight: bold;
}

.add-category-form {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  box-sizing: border-box;
}

.category-name-input {
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  margin-bottom: 10px;
  outline: none;
  box-sizing:border-box
}

.category-name-input:focus {
  border-color: rgba(0, 255, 120, 0.5);
}

.form-actions {
  display: flex;
  gap: 8px;
}

.confirm-button,
.cancel-button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.confirm-button {
  background: rgba(0, 255, 120, 0.2);
  color: #00ff78;
}

.confirm-button:hover {
  background: rgba(0, 255, 120, 0.3);
}

.cancel-button {
  background: rgba(255, 50, 50, 0.2);
  color: #ff6b6b;
}

.cancel-button:hover {
  background: rgba(255, 50, 50, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-content h3 {
  color: white;
  margin-bottom: 20px;
  font-size: 22px;
}

.modal-input {
  width: 100%;
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  margin-bottom: 20px;
  outline: none;
  box-sizing: border-box;
}

.modal-input:focus {
  border-color: rgba(0, 255, 120, 0.5);
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-confirm,
.modal-cancel {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.modal-confirm {
  background: rgba(0, 255, 120, 0.2);
  color: #00ff78;
  border: 1px solid rgba(0, 255, 120, 0.3);
}

.modal-confirm:hover {
  background: rgba(0, 255, 120, 0.3);
}

.modal-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>