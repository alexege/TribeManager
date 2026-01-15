import { defineStore } from 'pinia'
import api from "@/services/api"

import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'
import { useCategoryStore } from './category.store'

export const useTodoListStore = defineStore('todoList', {
    state: () => ({
        todoList: [],
        todoIndex: 0
    }),
    getters: {
        allTodos: (state) => state.todoList,
        completedTodos: (state) =>
            state.todoList.filter((todo) => todo.completed).reverse(),
        incompleteTodos: (state) =>
            state.todoList.filter((todo) => !todo.completed).reverse(),
        getTodosByCategory: (state) => (category) =>
            state.todoList
                .filter((todo) => !todo.completed)
                .filter((todo) =>
                    todo.categories.some((cat) => cat.name === category)
                ),
        getCompleteTodosByCategory: (state) => (category) => {
            const filtered = state.todoList.filter((todo) => todo.completed)
            return category === 'All'
                ? filtered
                : filtered.filter((todo) =>
                    todo.categories.some((cat) => cat.name === category)
                )
        },
        getIncompleteTodosByCategory: (state) => (category) => {
            const filtered = state.todoList.filter((todo) => !todo.completed)
            return category === 'All'
                ? filtered
                : filtered.filter((todo) =>
                    todo.categories.some((cat) => cat.name === category)
                )
        },
        myTodos: (state) => {
            const authStore = useAuthStore()
            if (!authStore.user) return
            return state.todoList.filter(
                (todo) => todo.author?._id === authStore.user._id
            )
        }
    },
    actions: {
        // ===== Fetch Todos =====
        async fetchTodos() {
            try {
                const { data } = await api.get('/todos')
                this.todoList = data
            } catch (err) {
                console.error('Error fetching todos:', err)
            }
        },
        // ===== Add Todo =====
        async addTodo(todo) {
            const userStore = useUserStore()
            const categoryStore = useCategoryStore()
            const author = userStore.users.find(
                (user) => user._id === todo.author
            )
            const category = categoryStore.categories.find(
                (cat) => cat.name === todo.category
            )
            try {
                const { data: createdTodo } = await api.post('/todos', todo)
                if (author) createdTodo.author = author
                if (category) createdTodo.categories.push(category)
                this.todoList.push(createdTodo)
            } catch (err) {
                console.error('Error adding todo:', err)
            }
        },
        // ===== Remove Category =====
        async removeCategory(todo, category) {
            try {
                await api.delete(`/todos/${todo._id}/category/${category}`)
                todo.categories = todo.categories.fitler(
                    (cat) => cat.name !== category
                )
            } catch (err) {
                console.error('Error removing category:', err)
            }
        },
        // ===== Delete Todo =====
        async deleteTodo(itemId) {
            try {
                await api.delete(`/todos/${itemId}`)
                this.todoList = this.todoList.filter(
                    (todo) => todo._id !== itemId
                )
            } catch (err) {
                console.error('Error deleting todo:', err)
            }
        },
        // ===== Edit Todo =====
        async editTodo(itemId, updateItem) {
            try {
                const { data: updatedTodo } = await api.put((`/todos/${itemId}`, updatedItem))
                const index = this.todoList.findIndex(
                    (todo) => todo._id === itemId
                )
                if (index !== -1) {
                    this.todoList.splice(index, 1, updatedTodo)
                }
            } catch (err) {
                console.error('Error editing todo:', err)
            }
        },
        // ===== Toggle Completed =====
        async toggleCompleted(todoItem) {
            try {
                const { data: updatedTodo } = await api.put(
                    `/todos/${todoItem._id}`,
                    {
                        completed: !todoItem.completed
                    }
                )
                const todo = this.todoList.find(
                    (t) => t._id === todoItem._id
                )
                if (todo) todo.completed = updatedTodo.completed
            } catch (err) {
                console.error('Error toggling todo completion:', err)
            }
        }
    }
})