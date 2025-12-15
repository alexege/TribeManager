import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
  // state
  const token = ref(localStorage.getItem("token"));
  const loading = ref(false);
  const error = ref(null);

  // getters
  const isAuthenticated = computed(() => !!token.value);

  // actions
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.post("/auth/login", credentials);
      token.value = res.data.token;
      localStorage.setItem("token", token.value);
      router.push("/dashboard");
    } catch (err) {
      error.value = err.response?.data?.message || "Login failed";
    } finally {
      loading.value = false;
    }
  };

  const register = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      await api.post("/auth/register", credentials);
      router.push("/");
    } catch (err) {
      error.value = err.response?.data?.message || "Registration failed";
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem("token");
    router.push("/");
  };

  return {
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
  };
});
