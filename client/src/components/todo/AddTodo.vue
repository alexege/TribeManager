<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useTodoListStore } from "@/stores/todo.store";
import { useCategoryStore } from "../../stores/category.store.js";
import { useAuthStore } from "../../stores/auth.store.js";
import { useUserStore } from "../../stores/user.store.js";
const { activeUser } = storeToRefs(useAuthStore())

const authStore = useAuthStore();
const userStore = useUserStore();
const todoStore = useTodoListStore();
var categoryStore = useCategoryStore();

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
  author: 'placeholder-author'
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
  <form @submit.prevent="addItemAndClear(newTodo)" class="add-todo-form">

    <div class="container">

      <div class="wrapper">
        <div class="left">
          <input class="form-input" type="text" v-model="newTodo.title" placeholder="Title" />

          <select name="priority" id="priority" v-model="newTodo.priority">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

        </div>
        <div class="bottom">
          <select v-model="selectedOption" @keydown.tab="addTodoCategory" class="select">
            <option value="" disabled>Category</option>
            <option value="custom">Custom</option>
            <option vale="">None</option>
            <option :value="category.name" v-for="category in allCategories" :key="category">{{ category.name }}
            </option>
          </select>

          <div v-show="selectedOption === 'custom'" class="add-category">
            <input type="text" v-model="customValue.name">
            <button @click.prevent="addACategory">Add</button>
          </div>
          <div class="category-list">
            <div class="category" v-for="category in todoCategories" :key="category._id">
              <a>
                <span>{{ category }}</span>
                <span v-if="permissionToManage(category)" @click.prevent="removeCategory(category)">
                  <i class='bx bx-x'></i>
                </span>
              </a>
            </div>
          </div>
        </div>


      </div>

      <div class="right">
        <!-- Custom Input / DropDown -->
        <button class="add-button" :disabled="newTodo.title == ''">Add</button>
      </div>

    </div>



  </form>
</template>

<style scoped>
.container {
  display: flex;
  outline: 2px solid white;
}

.select {
  min-height: 26px;
}

.wrapper {
  display: flex;
  flex-direction: column;
  flex: 6;
  background-color: rgba(255, 255, 255, 0.15);
}

.left {
  display: flex;
}

.right {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.add-todo-form {
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: 0 auto;
}

.top {
  display: flex;
  flex-direction: row;
}

.middle {
  display: flex;
  flex-direction: row;
}

.bottom {
  display: flex;
  flex-direction: row;
}

form {
  display: flex;
  flex: 1;
  width: 100%;
  /* height: 100%; */
}

.form-input {
  width: 100%;
  min-height: 2em;
}

.add-category {
  display: flex;
  flex-direction: row;
}

.category-list {
  display: flex;
  flex-direction: row;
  overflow: auto;
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

i {
  padding: .10em .25em;
  font-size: 20px;
  cursor: pointer;

  display: flex;
  justify-content: center;
}

i:hover {
  color: red;
}

.add-button {
  display: flex;
  flex: 1;
  height: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
