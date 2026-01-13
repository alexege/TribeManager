import { defineStore } from 'pinia'
import axios from 'axios'

import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'
import { useCategoryStore } from './category.store'

const API_URL = 'http://127.0.0.1:8080/api'

export const useTodoListStore = defineStore('todoList', {
  state: () => ({
    todoList: [],
    todoIndex: 0
  }),

  getters: {
    allTodos: (state) => state.todoList,

    completedTodos: (state) => state.todoList.filter((todo) => todo.completed).reverse(),

    incompleteTodos: (state) => state.todoList.filter((todo) => !todo.completed).reverse(),

    getTodosByCategory: (state) => (category) =>
      state.todoList
        .filter((todo) => !todo.completed)
        .filter((todo) => todo.categories.some((cat) => cat.name === category)),

    getCompleteTodosByCategory: (state) => (category) => {
      const filtered = state.todoList.filter((todo) => todo.completed)
      return category === 'All'
        ? filtered
        : filtered.filter((todo) => todo.categories.some((cat) => cat.name === category))
    },

    getInCompleteTodosByCategory: (state) => (category) => {
      const filtered = state.todoList.filter((todo) => !todo.completed)
      return category === 'All'
        ? filtered
        : filtered.filter((todo) => todo.categories.some((cat) => cat.name === category))
    },

    myTodos: (state) => {
      const authStore = useAuthStore()
      if (!authStore.user) return []

      return state.todoList.filter((todo) => todo.author?._id === authStore.user._id)
    }
  },

  actions: {
    async fetchTodos() {
      try {
        const res = await axios.get(`${API_URL}/todo`)
        this.todoList = res.data
      } catch (error) {
        console.error('Error fetching todos:', error)
      }
    },

    async addTodo(todo) {
      const usersStore = useUserStore()
      const categoryStore = useCategoryStore()

      const author = usersStore.users.find((user) => user._id === todo.author)
      const category = categoryStore.categories.find((cat) => cat.name === todo.category)

      try {
        const res = await axios.post(`${API_URL}/todo`, todo)
        const createdTodo = res.data

        // Assign author and category for front-end use
        if (author) createdTodo.author = author
        if (category) createdTodo.categories.push(category)

        this.todoList.push(createdTodo)
      } catch (error) {
        console.error('Error adding todo:', error)
      }
    },

    async removeCategory(todo, category) {
      try {
        await axios.delete(`${API_URL}/todo/${todo._id}/category/${category}`)
        todo.categories = todo.categories.filter((cat) => cat.name !== category)
      } catch (error) {
        console.error('Error removing category:', error)
      }
    },

    async deleteTodo(itemId) {
      try {
        await axios.delete(`${API_URL}/todo/${itemId}`)
        this.todoList = this.todoList.filter((todo) => todo._id !== itemId)
      } catch (error) {
        console.error('Error deleting todo:', error)
      }
    },

    async editTodo(itemId, updatedItem) {
      try {
        await axios.put(`${API_URL}/todo/${itemId}`, updatedItem)
        const index = this.todoList.findIndex((todo) => todo._id === itemId)
        if (index !== -1) {
          this.todoList.splice(index, 1, updatedItem)
        }
      } catch (error) {
        console.error('Error editing todo:', error)
      }
    },

    async toggleCompleted(todoItem) {
      try {
        const updatedTodo = {
          ...todoItem,
          completed: !todoItem.completed
        }

        await axios.put(`${API_URL}/todo/${todoItem._id}`, updatedTodo)

        const todo = this.todoList.find((t) => t._id === todoItem._id)
        if (todo) todo.completed = updatedTodo.completed
      } catch (error) {
        console.error('Error toggling todo completion:', error)
      }
    }
  }
})

// import { defineStore } from 'pinia'
// import axios from 'axios'
// const API_URL = 'http://127.0.0.1:8080/api'

// import { useUserStore } from '@/stores/user.store'
// import { useAuthStore } from '@/stores/auth.store'
// import { useCategoryStore } from './category.store'

// export const useTodoListStore = defineStore('todoList', {
//   state: () => ({
//     todoList: [],
//     todoIndex: 0
//   }),
//   getters: {
//     allTodos: (state) => {
//       return state.todoList
//     },
//     completedTodos: (state) => {
//       return state.todoList.filter((todo) => todo.completed).reverse()
//     },
//     incompleteTodos: (state) => {
//       return state.todoList.filter((todo) => !todo.completed).reverse()
//     },
//     myTodos: (state) => {
//       console.log(state.todoList[0].author._id)
//       console.log(useAuthStore.user)
//       // return state.todoList.filter((todo) => todo.author._id == )
//       return
//     },
//     getTodosByCategory: (state) => (category) => {
//       // return state.todoList.filter((todo) => todo.categories.some((cat) => cat.name == category))
//       return state.todoList
//         .filter((todo) => !todo.completed)
//         .filter((todo) => todo.categories.some((cat) => cat.name == category))
//       // todo.categories.some((cat) => cat.name == category))
//     },
//     getCompleteTodosByCategory: (state) => (category) => {
//       if (category == 'All') return state.todoList.filter((todo) => todo.completed)
//       return state.todoList
//         .filter((todo) => todo.completed)
//         .filter((todo) => todo.categories.some((cat) => cat.name == category))
//     },
//     getInCompleteTodosByCategory: (state) => (category) => {
//       if (category == 'All') return state.todoList.filter((todo) => !todo.completed)
//       return state.todoList
//         .filter((todo) => !todo.completed)
//         .filter((todo) => todo.categories.some((cat) => cat.name == category))
//     }
//   },
//   actions: {
//     async fetchTodos() {
//       try {
//         await axios.get(`${API_URL}/todo`).then((res) => {
//           this.todoList = res.data
//         })
//       } catch (error) {
//         console.log('Error: ', error)
//       }
//     },

//     // async fetchCategoryTodos(category) {
//     //   try {
//     //     await axios.get(`${API_URL}/todo/category/${category}`).then((res) => {
//     //       this.todoList = res.data
//     //     })
//     //   } catch (error) {
//     //     console.log('Error: ', error)
//     //   }
//     // },

//     async addTodo(todo) {
//       const author = useUserStore().users.find((user) => user._id == todo.author)
//       console.log('author:', author.username)

//       var todoItem = await axios.post(`${API_URL}/todo`, todo)

//       //Newly created todo will have author as an ID reference.
//       //For the sake of functionality, we will add in the user object using the id
//       if (author) {
//         // todoItem.data.author = { username: author.username }
//         todoItem.data.author = author
//       }

//       const category = useCategoryStore().categories.find(
//         (category) => category.name == todo.category
//       )

//       if (category) {
//         todoItem.data.categories.push(category)
//       }

//       console.log('response:', todoItem.data)
//       await this.todoList.push(todoItem.data)
//     },
//     async deleteTodo(itemId) {
//       console.log('Deleting todo: ', itemId)

//       await axios
//         .delete(`${API_URL}/todo/${itemId}`)

//         .then(() => {
//           const todoIndex = this.todoList.findIndex((todo) => todo._id === itemId)
//           console.log(`todoIndex: ${todoIndex}`)
//           if (todoIndex !== -1) {
//             this.todoList.splice(todoIndex, 1)
//           }
//         })
//         .catch((error) => {
//           console.log('Error: ', error)
//         })

//       this.todoList = this.todoList.filter((item) => item.id != itemId)
//     },
//     async editTodo(itemId, item) {
//       //   this.todoList = this.todoList.filter((item) => item.id != itemId)
//       console.log('Attempting to edit todo with id: ', itemId)
//       console.log('the new todo is:', item)
//       await axios.put(`${API_URL}/todo/${itemId}`, item)

//       const todoIndex = this.todoList.findIndex((todo) => todo._id === itemId)
//       this.todoList.splice(todoIndex, 1, item)
//     },
//     async toggleCompleted(item) {
//       const updateData = item
//       updateData.completed = !updateData.completed

//       await axios.put(`${API_URL}/todo/${item._id}`, updateData)

//       const todo = this.todoList.find((todo) => todo.id === item._id)
//       if (todo) {
//         todo.completed = !todo.completed
//       }
//     }
//   }
// })
