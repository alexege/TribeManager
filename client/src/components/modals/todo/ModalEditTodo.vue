<script setup>
import { reactive, watch, toRefs, ref } from 'vue';
import category from '../../../components/todo/Category.vue'

const props = defineProps({
    show: Boolean,
    todo: Object, // The original todo passed in
});

const emits = defineEmits(['close', 'update']);

const localTodo = reactive({
    title: null,
    priority: null,
    categories: null
});

// Keep local state in sync with incoming prop
watch(
    () => props.todo,
    (newTodo) => {
        if (newTodo) {
            localTodo.title = newTodo.title;
            localTodo.priority = newTodo.priority;
            localTodo.categories = newTodo.categories;
        }
    },
    { immediate: true }
);

function close() {
    emits('close');
}

function submitEdit() {
    emits('update', {
        ...props.todo,
        title: localTodo.title,
        priority: localTodo.priority
    }); // Merge the original todo with the updated title
    close();
}

const hoveredCategoryId = ref(null)

const handleMouseEnter = (id) => {
    hoveredCategoryId.value = id
}

const handleMouseLeave = () => {
    hoveredCategoryId.value = null
}

const deleteCategory = (category) => {
    console.log("Deleting category:", category)
}

</script>
<template>
  <Transition name="panel-slide">
    <div v-if="show" class="overlay" @click="close">
      <div class="panel" @click.stop>

        <div class="panel-header">
          <span>Edit Todo</span>
          <i class="bx bx-x close" @click="close" />
        </div>

        <div class="panel-body">
          <div class="controls">
            <input
              v-model="localTodo.title"
              class="title-input"
              placeholder="Todo name"
            />

            <select v-model="localTodo.priority" class="priority-select">
              <option value="High" class="high">High</option>
              <option value="Medium" class="medium">Medium</option>
              <option value="Low" class="low">Low</option>
            </select>
          </div>

          <div class="categories">
            <category
              v-for="c in localTodo.categories"
              :key="c._id"
              :category="c"
              :is-editable="true"
              @delete-category="deleteCategory"
            />
          </div>
        </div>

        <div class="panel-footer">
          <button class="ghost" @click="close">Cancel</button>
          <button class="primary" @click="submitEdit">Update</button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.high {
  color: red;
}

.medium {
  color: orange;
}

.low {
  color: green;
}

select option {
  background: black;
}

/* ───────── PANEL ANIMATION ───────── */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ───────── OVERLAY ───────── */
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  z-index: 50;
}

/* ───────── PANEL (MATCH TIMER WIDGET) ───────── */
.panel {
  width: 100%;
  max-width: 26rem;
  background: #111318; /* same dark base */
  border-radius: 14px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* ───────── HEADER ───────── */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
}

.close {
  cursor: pointer;
  opacity: 0.6;
}

.close:hover {
  opacity: 1;
}

/* ───────── BODY ───────── */
.panel-body {
  padding: 0.5rem 0.75rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 0.4rem;
  margin-bottom: 0.75rem;
}

/* INPUTS */
.title-input {
  flex: 1;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.95);
  padding: 0.45rem 0.5rem;
  outline: none;
  font-size: 0.85rem;
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.priority-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  padding: 0.45rem 0.6rem;
  font-size: 0.75rem;
}

/* ───────── CATEGORIES ───────── */
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ───────── FOOTER ───────── */
.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
}

button {
  background: none;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Cancel (matches timer secondary actions) */
button.ghost {
  color: rgba(255, 255, 255, 0.55);
}

button.ghost:hover {
  color: rgba(255, 255, 255, 0.85);
}

/* Primary (same blue accent timers use) */
button.primary {
  color: #3b82f6;
}

button.primary:hover {
  color: #60a5fa;
}

</style>