<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

// Components
import Todo from '@/components/todo/Todo.vue';
import AddTodo from '@/components/todo/AddTodo.vue';

// Stores
import { useTodoListStore } from '@/stores/todo.store';
import { useCategoryStore } from '@/stores/category.store';
import { useAuthStore } from "@/stores/auth.store";

// TodoList Store
const todoStore = useTodoListStore();
const { completedTodos, incompleteTodos } = storeToRefs(todoStore);
const { fetchTodos } = todoStore;
fetchTodos();

// Category Store
const categoryStore = useCategoryStore();
const { allCategories } = storeToRefs(categoryStore);
categoryStore.fetchCategories();

// Route Handling
const route = useRoute();
const category = ref(route.params.category);

const addItemInput = ref(null);
// const headers = ['[✓]', 'Categories', 'Title', 'Author', 'Priority', 'Actions']; // Define headers for the grid
const headers = [
  { label: '[✓]', key: null },
  { label: 'Categories', key: 'Categories' },
  { label: 'Title', key: 'Title' },
  { label: 'Author', key: 'Author' },
  { label: 'Priority', key: 'Priority' },
  { label: 'Actions', key: null }
]

// Sort Logic
const sortBy = ref(null)
const sortDir = ref(1)

const toggleSort = (header) => {
  if (sortBy.value === header) {
    sortDir.value = sortDir.value * -1
  } else {
    sortBy.value = header
    sortDir.value = 1
  }
}

const sortedTodosIncomplete = computed(() => {
  let list = category.value
    ? todoStore.getInCompleteTodosByCategory(category.value)
    : incompleteTodos.value

  if (!sortBy.value) return list

  return [...list].sort((a, b) => {
    const valA = getSortableValue(a, sortBy.value)
    const valB = getSortableValue(b, sortBy.value)

    if (sortBy.value === 'Priority') {
      const orderA = priorityOrder[valA?.charAt(0).toUpperCase() + valA?.slice(1).toLowerCase()] ?? -1
      const orderB = priorityOrder[valB?.charAt(0).toUpperCase() + valB?.slice(1).toLowerCase()] ?? -1
      return (orderA - orderB) * sortDir.value
    }

    if (valA < valB) return -1 * sortDir.value
    if (valA > valB) return 1 * sortDir.value
    return 0
  })
})

const sortedTodosComplete = computed(() => {

  let list = category.value
    ? todoStore.getCompleteTodosByCategory(category.value)
    : completedTodos.value

  if (!sortBy.value) return list

  return [...list].sort((a, b) => {
    const valA = getSortableValue(a, sortBy.value)
    const valB = getSortableValue(b, sortBy.value)

    if (sortBy.value === 'Priority') {
      const orderA = priorityOrder[valA?.charAt(0).toUpperCase() + valA?.slice(1).toLowerCase()] ?? -1
      const orderB = priorityOrder[valB?.charAt(0).toUpperCase() + valB?.slice(1).toLowerCase()] ?? -1
      return (orderA - orderB) * sortDir.value
    }

    if (valA < valB) return -1 * sortDir.value
    if (valA > valB) return 1 * sortDir.value
    return 0
  })
})

const priorityOrder = {
  'Low': 1,
  'Medium': 2,
  'High': 3
}

function getSortableValue(todo, column) {
  switch (column) {
    case 'Categories':
      return todo.categories?.[0]?.name || ''
    case 'Title':
      return todo.title || ''
    case 'Author':
      return todo.author?.name || ''
    case 'Priority':
      return todo.priority?.charAt(0).toUpperCase() + todo.priority?.slice(1).toLowerCase()
    default:
      return ''
  }
}

const newItem = ref({
  completed: false,
  categories: [],
  description: null,
  priority: 'Low'
});

const deleteCategory = (category) => {
  console.log("Deleting category:", category)
}

//  Computed
const filteredTodosComplete = computed(() =>
  category.value ? todoStore.getCompleteTodosByCategory(category.value) : completedTodos.value
);

const filteredTodosIncomplete = computed(() =>
  category.value ? todoStore.getInCompleteTodosByCategory(category.value) : incompleteTodos.value
);

// Auth Store
const { activeUser } = storeToRefs(useAuthStore());

// Permission Handling
const hasPermission = (category) => {
  if (!activeUser.value) return false;
  return (
    category.author?.id === activeUser.value.id ||
    activeUser.value.roles.includes("ROLE_ADMIN") ||
    activeUser.value.roles.includes("ROLE_MODERATOR")
  );
};

// Filter by active category
const activeCategoryFilter = ref('All')
const activeCategory = (cat) => {
  if (activeCategoryFilter.value === cat) {
    console.log("is equal");
    activeCategoryFilter.value = 'All';
    category.value = 'All';
  } else {
    activeCategoryFilter.value = cat;
    category.value = cat;
  }

  //TODO: Update store to keep track of active category to highlight todo categories
}
</script>

<template>
  <div id="app">
    <div class="container">
      <h1 class="title">To do List</h1>
      <AddTodo />

      <!-- Category List -->
      <div class="category-list">
        <div class="category" @click.prevent="activeCategory('All')"
          :class="{ active: activeCategoryFilter === 'All' }">All</div>
        <div v-for="category in allCategories" :key="category" class="category"
          :class="{ active: category.name === activeCategoryFilter }" @click.prevent="activeCategory(category.name)">
          <span>{{ category.name }}</span>
        </div>
      </div>

      <!-- Incomplete Item Rows -->
      <div class="incomplete-items" v-if="filteredTodosIncomplete.length">
        <h4 class="grid-title incomplete">Incomplete Items ({{ filteredTodosIncomplete.length }})</h4>
        <!-- Header Row -->
        <div class="grid-header">
          <div class="grid-header-item" v-for="(header, index) in headers" :key="'header-' + index"
            @click="header.key && toggleSort(header.key)">
            {{ header.label }}
            <span v-if="sortBy === header.key">
              {{ sortDir === 1 ? '↑' : '↓' }}
            </span>
          </div>
        </div>

        <hr style="margin-bottom: .75em;">

        <div class="grid-items">
          <div v-for="todo in sortedTodosIncomplete" :key="todo._id">
            <!-- <todo :todo="todo" @category="handleCategorySelection" /> -->
            <todo :todo="todo" @category="activeCategory($event)" />
          </div>
        </div>
      </div>

      <!-- Completed Item Rows -->
      <div class="completed-items" v-if="filteredTodosComplete.length">

        <h4 class="grid-title completed">Completed Items ({{ filteredTodosComplete.length }})</h4>

        <!-- Header Row -->
        <div class="grid-header">
          <div class="grid-header-item" v-for="(header, index) in headers" :key="'header-' + index"
            @click="header.key && toggleSort(header.key)">
            {{ header.label }}
            <span v-if="sortBy === header.key">
              {{ sortDir === 1 ? '↑' : '↓' }}
            </span>
          </div>
        </div>

        <hr style="margin-bottom: .75em;">

        <div class="grid-items">
          <div v-for="todo in sortedTodosComplete" :key="todo._id">
            <todo :todo="todo" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active {
  color: black;
  background-color: white;
  border: 1px solid black;
  /* background-color: rgba(255, 255, 255, 0.15); */
}

#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 20px;
  /* width: 80%; */
  margin: 0 auto;
}

.container {
  width: 80%;
  margin: 0 auto;
}

h1.title {
  margin: 1.5em;
}

/* Category List */
.category-list {
  max-width: 80%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 0.5em;
  padding: 1em;
  flex-wrap: wrap;
}

.category {
  font-size: .75em;
  border: 1px solid white;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
}

.delete-category {
  border: 1px solid white;
  border-radius: 50%;
  padding: 2px 4px;
  margin: 0 2px;
  cursor: pointer;
}

.delete-category:hover {
  color: red;
}

.grid-title {
  color: white;
  margin: 1em;
}

.grid-title.incomplete {
  color: #ff0000;
}

.grid-title.completed {
  color: #00ff00;
}

.grid-header {
  display: grid;
  grid-template-columns: .5fr 2fr 4fr 1fr 1fr 1fr;
  /* 4 equal-width columns */
  margin-bottom: 10px;
  gap: 10px;
  font-weight: bold;
  text-align: center;
}

.grid-header-item {
  color: white;
  cursor: pointer;
}

.grid-items {
  display: grid;
  grid-template-columns: 1fr;
  /* Single column to ensure each item takes up an entire row */
  gap: 10px;
  margin-bottom: 5em;
}

.grid-item {
  display: grid;
  grid-template-columns: .5fr 3fr 1fr 1fr 1fr;
  /* 4 equal-width columns for each item */
  gap: 10px;
  color: white;
  /* border: 1px solid #ccc; */
  /* background-color: #f9f9f9; */
}

.grid-item-field {
  display: flex;
  padding: 5px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.grid-item-field:not(:first-of-type):not(:last-of-type) {
  border: 1px solid #ccc;
}

.grid-item-field.actions {
  display: flex;
  justify-content: space-around;
  align-items: center;
  cursor: pointer;
}

.grid-item-field.actions button {
  padding: .25em;
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

.add-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.add-item-button {
  margin: 1em 0;
  padding: .25em;
  cursor: pointer;
}

.add-item input[type="text"] {
  height: 25px;
  min-width: 30em;
}

.add-item select {
  height: 30px;
  width: 85px;
}

.low {
  color: lime;
}

.med {
  color: orange;
}

.high {
  color: red;
}
</style>
