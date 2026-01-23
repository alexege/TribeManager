<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from 'pinia'

import ModalEditTodo from "../modals/todo/ModalEditTodo.vue";
import Category from "./Category.vue";

const emit = defineEmits(['category'])
const props = defineProps({ todo: Object })
const authStore = useAuthStore()
const activeUser = computed(() => authStore.activeUser)

// Auth Store
import { useAuthStore } from "@/stores/auth.store";
// const { activeUser } = storeToRefs(useAuthStore())

// Todo Store
import { useTodoListStore } from "@/stores/todo.store";
const todoStore = useTodoListStore()

const isEditing = ref(false)
const editItem = ref(props.todo)

// const activeUser = computed(() => {
//   return useAuthStore().activeUser
// })

const canManage = computed(() => {
  if (!activeUser) return false
  const user = activeUser
  return (
    user.value.roles.includes("ROLE_ADMIN" ) ||
    user.value.roles.includes("ROLE_MODERATOR") ||
    (props.todo.author && user.id === props.todo.author._id)
  )
})

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
  editItem.value = props.todo
}

const updateTodo = (updatedTodo) => {
  isEditing.value = false
  todoStore.editTodo(updatedTodo._id, updatedTodo)
}

const deleteTodoItem = (itemId) => {
  if (confirm('Are you sure you wish to delete this item?')) {
    todoStore.deleteTodo(itemId)
  }
}

const scrollContainer = ref(null)
const handleWheel = (event) => {
  if (scrollContainer.value) scrollContainer.value.scrollLeft += event.deltaY
}
</script>


<template>
<div>
  <Transition name="todo-complete">
    <div class="todo-row-panel" :class="{ completed: todo.completed }">

    <div class="grid completion">
      <input
        v-if="canManage"
        type="checkbox"
        class="checkbox"
        @click="todoStore.toggleCompleted(todo)"
        :checked="todo.completed"
      />
    </div>

    <div class="grid categories" @wheel.prevent="handleWheel" ref="scrollContainer">
      <div class="category-wrapper">
        <Category
          v-for="category in todo.categories"
          :key="category._id"
          :category="category"
          @category="$emit('category', $event)"
        />
      </div>
    </div>

    <div class="grid content">
      <span
        class="todo-body"
        :class="{ completed: todo.completed }"
        @dblclick="toggleEditMode"
      >
        {{ todo.title }}
      </span>
    </div>

    <div class="grid author">
      <!-- {{ todo.author?.name || '' }} -->
      <div class="user-chip">
          <img v-if="activeUser?.avatarUrl" :src="activeUser.avatarUrl" alt="avatar" class="avatar" loading="lazy" />
          <div v-else class="avatar fallback">
              {{ initials }}
          </div>

          <span class="username">
              {{ activeUser?.name || activeUser?.username }}
          </span>
      </div>
    </div>


    <div
      class="grid priority"
      :class="todo.priority?.toLowerCase()"
    >
      {{ todo.priority }}
    </div>

    <div class="grid actions">
      <i
        class="bx bx-edit"
        :class="{ disabled: !canManage }"
        @click="canManage && toggleEditMode()"
      ></i>
      <i
        class="bx bx-trash"
        :class="{ disabled: !canManage }"
        @click="canManage && deleteTodoItem(todo._id)"
      ></i>
    </div>

    </div>
  </Transition>

    <ModalEditTodo
      :show="isEditing"
      :todo="editItem"
      @close="isEditing = false"
      @update="updateTodo"
    />
  </div>
</template>


<style scoped>
/* ROW PANEL */
.todo-row-panel {
  display: grid;
  grid-template-columns: .5fr 2fr 4fr 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.35rem;
  /* background: rgba(15,15,15,0.75); */
  background: rgba(105,105,105,0.35);
  border: 1px solid rgba(255,255,255,0.15);
}

/* GRID CELLS */
.grid {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
}

/* Completion */
.checkbox {
  cursor: pointer;
  transform: scale(0.9);
}

/* Categories */
.categories {
  justify-content: flex-start;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-wrapper {
  display: inline-flex;
  gap: 0.35rem;
}

/* Content */
.content {
  justify-content: flex-start;
}

.todo-body {
  cursor: pointer;
  transition:
  opacity 0.25s ease,
  transform 0.25s ease;
}

.todo-body.completed {
  opacity: 0.4;
  text-decoration: line-through;

  transform: translateX(4px);
}

/* Author */
.author {
  opacity: 0.7;
  font-size: 0.7rem;
}

/* Priority */
.priority {
  border: 1px solid rgba(255,255,255,0.3);
  font-weight: bold;
  font-size: 0.65rem;
}

.priority.low {
  color: lime;
  border-color: lime;
}

.priority.medium {
  color: orange;
  border-color: orange;
}

.priority.high {
  color: red;
  border-color: red;
}

/* Actions */
.actions {
  gap: 0.5rem;
}

.actions i {
  cursor: pointer;
  opacity: 0.7;
}

.actions i:hover {
  opacity: 1;
}

.actions i.disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* Hover */
.todo-row-panel:hover {
  border-color: lime;
}

/* -------------------------------
   Completion Animation
-------------------------------- */

/* Base completed state */
.todo-row-panel.completed {
  opacity: 0.55;
}

/* Transition states */
.todo-complete-enter-active,
.todo-complete-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

/* When toggling to completed */
.todo-complete-enter-from {
  opacity: 1;
  transform: translateX(0);
}

.todo-complete-enter-to {
  opacity: 0.55;
  transform: translateX(6px);
}

/* When toggling back to incomplete */
.todo-complete-leave-from {
  opacity: 0.55;
  transform: translateX(6px);
}

.todo-complete-leave-to {
  opacity: 1;
  transform: translateX(0);
}


/* ---------------- USER CHIP ---------------- */

.user-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    /* padding: 0.3rem 0.6rem; */
    padding: 0.15rem 0.3rem;
    border-radius: 999px;
    /* background: var(--primary-color); */
}

.user-chip:hover {
    background: white;
    color: black;
}

.user-chip .username {
    color: var(--text-primary);
}

.user-chip:hover .username {
    color: black;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar.fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 600;
    background: hsl(210, 70%, 80%);
}

.username {
    font-size: 0.85rem;
    font-weight: 500;
}
</style>