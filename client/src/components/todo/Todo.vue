<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from 'pinia'

import ModalEditTodo from "../modals/todo/ModalEditTodo.vue";
import Category from "./category.vue";

const emit = defineEmits(['category'])
const props = defineProps({ todo: Object })
const authStore = useAuthStore()
const activeUser = computed(() => authStore.user)

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
  <div class="todo-container">
    <div class="completion grid-item-field">
      <input v-if="canManage" type="checkbox" class="checkbox" @click="todoStore.toggleCompleted(todo)"
        :checked="todo.completed" />
    </div>

    <div class="categories grid-item-field" @wheel.prevent="handleWheel" ref="scrollContainer">
      <div class="category-wrapper">
        <Category v-for="category in todo.categories" :key="category._id" :category="category"
          @category="$emit('category', $event)" />
      </div>
    </div>

    <div class="content grid-item-field">
      <span class="todo-body" @dblclick="toggleEditMode">
        <span :class="{ completed: todo.completed }">{{ todo.title }}</span>
      </span>
    </div>

    <div class="author grid-item-field">
      <template v-if="todo.author?.name">{{ todo.author.name }}</template>
    </div>

    <div class="priority grid-item-field"
      :class="{ high: todo.priority === 'High', medium: todo.priority === 'Medium', low: todo.priority === 'Low' }">
      <span class="priority">{{ todo.priority }}</span>
    </div>

    <div class="actions grid-item-field">
      <span :class="{ disabled: !canManage }" @click="canManage && toggleEditMode">
        <i class="bx bx-edit"></i>
      </span>
      <span :class="{ disabled: !canManage }" @click="canManage && deleteTodoItem(todo._id)">
        <i class="bx bx-trash"></i>
      </span>
    </div>

    <ModalEditTodo :show="isEditing" :todo="editItem" @close="isEditing = false" @update="updateTodo" />
  </div>
</template>

<style scoped>
.category-wrapper {
  display: inline-flex;
  gap: 5px;

  margin-left: auto;
  margin-right: auto;

  /* Prevent shrinking and allow wrapping to stay horizontal */
  white-space: nowrap;
  flex-shrink: 0;
}

.checkbox {
  cursor: pointer;
}

.todo-container {
  display: grid;
  grid-template-columns: .5fr 2fr 4fr 1fr 1fr 1fr;
  gap: 10px;
}

.grid-item-field {
  display: flex;
  padding: 5px;
  justify-content: center;
  align-items: center;
  /* flex-wrap: wrap; */
  gap: 5px;
  outline: 1px solid white;
  background-color: rgba(255, 255, 255, 0.15);
  max-height: 26px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  scrollbar-width: none;
}

/* .grid-item-field:not(:first-of-type):not(:last-of-type) { */
.grid-item-field:not(:nth-child(1)):not(:nth-child(2)):not(:nth-child(5)):not(:last-of-type) {
  border: 1px solid #ccc;
}

.grid-item-field.actions {
  display: flex;
  justify-content: space-around;
  align-items: center;
  cursor: pointer;
}

.grid-item-field.actions button {
  /* padding: .25em; */
  background: none;
  color: white;
  border: 1px solid white;
  cursor: pointer;
}

.grid-item-field.actions button:hover {
  padding: .25em;
  background: none;
  color: black;
  background-color: white;
  border: 1px solid black;
  cursor: pointer;
}

.completion {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.categories {
  display: flex;
  justify-content: flex-start;
  scroll-behavior: smooth;
  align-items: center;
  flex: 2;
  gap: 5px;
}

.priority {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  flex: 5;
}

.author {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.actions {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
}

.actions .bx {
  cursor: pointer;
}

.actions .disabled .bx {
  opacity: 0.25;
  cursor: not-allowed;
}

/* Categories */
.category {
  /* display: flex; */
  /* align-items: center; */
  /* border-radius: 15px; */
  /* padding: 2px 6px; */
  /* margin-right: 4px; */
  position: relative;
  /* color: black; */
  color: white;
  /* background-color: #eef; */
  border: 1px solid white;
  padding: 2px 10px;
  font-size: 0.8em;
  justify-content: center;
  border-radius: 20px;
}

.category:hover {
  outline: 1px solid lime;
}

.category-x {
  position: absolute;
  top: -5px;
  right: -5px;
  cursor: pointer;
  border-radius: 50%;
  background: white;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.category a {
  min-height: 20px;
  text-decoration: none;
  /* color: black; */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.category a:hover {
  cursor: pointer;
  color: purple;
}

/* Priority */
.high {
  background-color: red;
  color: white;
  font-weight: bold;
  min-width: 30px;
  cursor: pointer;
}

.medium {
  background-color: orange;
  color: white;
  font-weight: bold;
  min-width: 30px;
  cursor: pointer;
}

.low {
  background-color: green;
  color: white;
  font-weight: bold;
  min-width: 30px;
  cursor: pointer;
}
</style>