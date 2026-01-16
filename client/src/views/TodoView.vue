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
    ? todoStore.getIncompleteTodosByCategory(category.value)
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
  category.value ? todoStore.getIncompleteTodosByCategory(category.value) : incompleteTodos.value
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
  <div class="todo-view">

    <h1 class="view-title">TASK CONTROL</h1>

    <!-- Add Todo Panel -->
    <AddTodo />

    <!-- Category Filters -->
    <div class="category-strip">
      <div
        class="category-chip"
        :class="{ active: activeCategoryFilter === 'All' }"
        @click="activeCategory('All')"
      >
        ALL
      </div>

      <div
        v-for="category in allCategories"
        :key="category._id"
        class="category-chip"
        :class="{ active: category.name === activeCategoryFilter }"
        @click="activeCategory(category.name)"
      >
        {{ category.name }}
      </div>
    </div>

    <!-- Incomplete -->
    <section v-if="filteredTodosIncomplete.length" class="todo-panel">
      <h4 class="panel-title incomplete">
        INCOMPLETE ({{ filteredTodosIncomplete.length }})
      </h4>

      <div class="grid-header">
        <div
          v-for="(header, index) in headers"
          :key="index"
          class="grid-header-item"
          @click="header.key && toggleSort(header.key)"
        >
          {{ header.label }}
          <span v-if="sortBy === header.key">
            {{ sortDir === 1 ? '▲' : '▼' }}
          </span>
        </div>
      </div>

      <div class="grid-items">
        <todo
          v-for="todo in sortedTodosIncomplete"
          :key="todo._id"
          :todo="todo"
          @category="activeCategory($event)"
        />
      </div>
    </section>

    <!-- Completed -->
    <section v-if="filteredTodosComplete.length" class="todo-panel">
      <h4 class="panel-title completed">
        COMPLETED ({{ filteredTodosComplete.length }})
      </h4>

      <div class="grid-header">
        <div
          v-for="(header, index) in headers"
          :key="index"
          class="grid-header-item"
          @click="header.key && toggleSort(header.key)"
        >
          {{ header.label }}
          <span v-if="sortBy === header.key">
            {{ sortDir === 1 ? '▲' : '▼' }}
          </span>
        </div>
      </div>

      <div class="grid-items">
        <todo
          v-for="todo in sortedTodosComplete"
          :key="todo._id"
          :todo="todo"
        />
      </div>
    </section>

  </div>
</template>


<style scoped>
.todo-view {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
  color: white;
}

/* Title */
.view-title {
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.15em;
  opacity: 0.8;
  margin-bottom: 1rem;
}

/* Category Filter Strip */
.category-strip {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.category-chip {
  padding: 0.3rem 0.8rem;
  border: 1px solid rgba(255,255,255,0.3);
  font-size: 0.7rem;
  cursor: pointer;
}

.category-chip.active {
  border-color: lime;
  color: lime;
}

/* Panels */
.todo-panel {
  margin-top: 1.25rem;
  padding: 0.75rem;
  background: rgba(15,15,15,0.85);
  border: 1px solid rgba(255,255,255,0.15);
}

/* Panel Titles */
.panel-title {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.panel-title.incomplete {
  color: red;
}

.panel-title.completed {
  color: lime;
}

/* Grid Header */
.grid-header {
  display: grid;
  grid-template-columns: .5fr 2fr 4fr 1fr 1fr 1fr;
  gap: 0.5rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.grid-header > :nth-child(2),
.grid-header > :nth-child(3) {
  text-align: left;
}

.grid-header-item {
  text-align: center;
  font-size: 0.7rem;
  opacity: 0.7;
  cursor: pointer;
}

.grid-header-item:hover {
  opacity: 1;
}

/* Items */
.grid-items {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

/* Priority colors */
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
