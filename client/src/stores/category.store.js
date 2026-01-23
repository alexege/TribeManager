import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
export const useCategoryStore = defineStore("category", () => {
  // State
  const categories = ref([{ name: "All" }]);
  const loading = ref(false);
  const error = ref(null);
  const category = ref(null);

  // Helpers
  const clearError = () => {
    error.value = null;
  };

  // Getters
  const allCategories = computed(() => categories.value);

  // Actions
  const fetchCategories = async () => {
    loading.value = true;
    clearError();
    try {
      const { data } = await api.get("/categories");
      categories.value = [...data];
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.log("Error fetching categories:", err);
    } finally {
      loading.value = false;
    }
  };

  const addCategory = async (newCategory) => {
    loading.value = true;
    clearError();
    try {
      const { data } = await api.post("/categories", newCategory);
      categories.value.push(data);
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error adding category:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (updatedCategory) => {
    loading.value = true;
    clearError();
    try {
      const { data } = await api.put(
        `/categories/${updatedCategory._id}`,
        updatedCategory,
      );
      const idx = categories.value.findIndex(
        (c) => c._id === updatedCategory._id,
      );
      if (idx !== -1) {
        categories.value[idx] = { ...categories.value[idx], ...data };
      }
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error updating category:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (_id) => {
    loading.value = true;
    clearError();
    try {
      await api.delete(`/categories/${_id}`);
      categories.value = categories.value.filter((c) => c._id !== _id);
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      console.error("Error deleting category:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAllCategories = async () => {
    loading.value = true;
    clearError();
    try {
      await api.delete("/categories");
      categories.value = [{ name: "All" }];
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    category,
    loading,
    error,
    allCategories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteAllCategories,
  };
});
