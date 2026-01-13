import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8080/api'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    category: null,
    categories: ['All']
  }),
  getters: {
    allCategories: (state) => {
      return state.categories
    }
  },
  actions: {
    async fetchCategories() {
      this.categories = []
      this.loading = true
      try {
        this.categories = await fetch(`${API_URL}/categories`).then((response) => response.json())
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async addCategory(category) {
      const newCategory = await axios.post(`${API_URL}/categories`, category)
      this.categories.push(newCategory.data)
    },

    async updateCategory(updatedCategory) {
      console.log('updatedCategory')
      try {
        await axios.patch(`${API_URL}/categories/${updatedCategory._id}`, updatedCategory)

        let categoryToUpdateIdx = this.categories.indexOf(
          this.categories.find((category) => category._id == updatedCategory._id)
        )

        let merged = {
          ...this.categories[categoryToUpdateIdx],
          ...updatedCategory
        }

        this.categories[categoryToUpdateIdx] = merged
      } catch (error) {
        console.log('error:', error)
      }
    },

    async deleteCategory(id) {
      try {
        await axios.delete(`${API_URL}/categories/${id}`).then(() => {
          let index = this.categories.findIndex((category) => category._id == id)
          this.categories.splice(index, 1)
        })
      } catch (error) {
        console.log('error:', error)
      }
    }
  }
})
