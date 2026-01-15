<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useTodoListStore } from "@/stores/todo.store";
import { useCategoryStore } from "../../stores/category.store.js";
import { useAuthStore } from "../../stores/auth.store.js";
import { useUserStore } from "../../stores/user.store.js";
// const { activeUser } = storeToRefs(useAuthStore())

const authStore = useAuthStore();
const userStore = useUserStore();
const todoStore = useTodoListStore();
var categoryStore = useCategoryStore();

const activeUser = computed(() => authStore.activeUser);

userStore.fetchUsers()
categoryStore.allCategories

const newTodo = ref({
  title: "",
  completed: false,
  author: "",
  category: [],
  priority: "Low",
});

const addItemAndClear = () => {

  let categories = [];
  // if (customValue.value && customValue.value.name) {
  //   categories.push(customValue.value.name)
  // }
  // if (selectedOption.value) {
  //   categories.push(selectedOption.value)
  // }

  todoCategories.value.forEach((item) => categories.push(item))

  let todo = {
    title: newTodo.value.title,
    categories: categories,
    priority: newTodo.value.priority,
    completed: newTodo.value.completed,
    author: activeUser.value._id || newTodo.value.author,
    // author: JSON.parse(localStorage.getItem('user'))._id || newTodo.value.author,
  };

  if (newTodo.value.title) {
    //Add new Todo to Pinia
    todoStore.addTodo(todo);

    //Reset properties to their starting values
    newTodo.value.title = "";
    newTodo.value.completed = false;

    selectedOption.value = "None"
    todoCategories.value = []

    //TODO: Add id of the selected Category to the Todo Object
    // newTodo.value.category = customValue.value._id
  }
};

//Custom Dropdown
const selectedOption = ref('')
const customValue = ref({
  name: null,
  // author: JSON.parse(localStorage.getItem('user')).id || newTodo.value.author
  author: activeUser.value._id || newTodo.value.author
})

const addACategory = async () => {
  if (customValue.value) {

    addTodoCategory()

    //Add Category via Category store
    let newCategory = await categoryStore.addCategory(customValue.value)
    console.log("newCat:", newCategory);
    selectedOption.value = customValue.value.name
  }

  customValue.value.name = ''
}

categoryStore.fetchCategories()

//Retrieve all custom categories
const { allCategories } = storeToRefs(useCategoryStore());

const todoCategories = ref([])

const addTodoCategory = () => {

  if (!todoCategories.value.includes(selectedOption.value)) {

    if (selectedOption.value !== "custom"
      && selectedOption.value !== "All"
      && selectedOption.value !== "None"
    ) {
      todoCategories.value.push(selectedOption.value)
    }

    if (customValue.value.name && customValue.value !== "") {
      todoCategories.value.push(customValue.value.name)
    }

    // if (customValue.value.name !== null) {
    //   todoCategories.value.push(customValue.value)
    // }
  }
}

const removeCategory = (category) => {
  let idxOfCat = todoCategories.value.indexOf(category)
  todoCategories.value.splice(idxOfCat, 1);
}


// Permission to interact / edit content
const permissionToManage = (category) => {
  console.log("category:", category);
  console.log("ActiveUser.value:", activeUser.value);
  // Admin, Moderator, Author/Owner

  if (activeUser.value) {

    // Content Owner
    if (category.author && activeUser.value.id === category.author._id) {
      //Has full access, as is owner
    } else if (activeUser.value.roles.includes("ROLE_ADMIN")) {
      //Has full access, as is admin
    } else if (activeUser.value.roles.includes("ROLE_MODERATOR")) {
      //Has full access, as is moderator
    } else {
      return false
    }
    return true
  }
}

</script>
<template>
  <form @submit.prevent="addItemAndClear" class="todo-panel">

  <div class="todo-row title-row">
    <input
      class="todo-title"
      v-model="newTodo.title"
      placeholder="New task…"
    />
    <button class="add-btn" :disabled="!newTodo.title">
      ADD
    </button>
  </div>

  <div class="todo-row controls-row">
    <!-- Priority -->
    <div class="priority-group">
      <button
        v-for="p in ['Low','Medium','High']"
        :key="p"
        type="button"
        :class="['priority-btn', p.toLowerCase(), { active: newTodo.priority === p }]"
        @click="newTodo.priority = p"
      >
        {{ p }}
      </button>
    </div>

    <!-- Category Select -->
    <select v-model="selectedOption" @change="addTodoCategory">
      <option disabled value="">Category</option>
      <option value="custom">+ Custom</option>
      <option
        v-for="category in allCategories"
        :key="category._id"
        :value="category.name"
      >
        {{ category.name }}
      </option>
    </select>
  </div>

  <!-- Custom Category -->
  <div v-if="selectedOption === 'custom'" class="todo-row">
    <input
      class="todo-title"
      placeholder="New category"
      v-model="customValue.name"
    />
    <button class="add-btn secondary" @click.prevent="addACategory">
      ADD
    </button>
  </div>

  <!-- Category Chips -->
  <div class="category-strip">
    <div
      class="category-chip"
      v-for="category in todoCategories"
      :key="category"
    >
      {{ category }}
      <i class="bx bx-x" @click="removeCategory(category)"></i>
    </div>
  </div>

</form>

</template>

<style scoped>
.todo-panel {
  width: 100%;
  max-width: 720px;
  margin: 1.5rem auto;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(15, 15, 15, 0.85);
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Rows */
.todo-row {
  display: flex;
  gap: 0.5rem;
}

/* Title Row */
.title-row {
  align-items: stretch;
}

.todo-title {
  flex: 1;
  padding: 0.6rem 0.75rem;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  font-size: 0.9rem;
}

.todo-title:focus {
  outline: none;
  border-color: lime;
}

/* Buttons */
.add-btn {
  padding: 0 1rem;
  background: rgba(0,255,120,0.15);
  border: 1px solid lime;
  color: lime;
  font-weight: 600;
  cursor: pointer;
}

.add-btn.secondary {
  border-color: cyan;
  color: cyan;
  background: rgba(0,255,255,0.12);
}

.add-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Controls Row */
.controls-row {
  align-items: center;
  justify-content: space-between;
}

/* Priority */
.priority-group {
  display: flex;
  gap: 0.25rem;
}

.priority-btn {
  padding: 0.3rem 0.6rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
}

.priority-btn.active {
  border-color: lime;
  color: lime;
}

.priority-btn.high.active {
  border-color: red;
  color: red;
}

.priority-btn.medium.active {
  border-color: orange;
  color: orange;
}

/* Select */
select {
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  padding: 0.4rem;
}

/* Categories */
.category-strip {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid rgba(255,255,255,0.25);
  font-size: 0.7rem;
  color: white;
}

.category-chip i {
  cursor: pointer;
  opacity: 0.6;
}

.category-chip i:hover {
  color: red;
}

</style>
