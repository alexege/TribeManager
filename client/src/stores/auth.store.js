import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
  // state
  const token = ref(localStorage.getItem("token"));
  const user = ref(null);
  const loading = ref(false);
  const initialized = ref(false);
  const error = ref(null);

  // getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // 🔁 Restore session on refresh
  const initialize = async () => {
    if (!token.value) {
      initialized.value = true;
      return;
    }

    try {
      const res = await api.get("/auth/me");
      user.value = res.data;
    } catch (err) {
      // token invalid / expired
      logout(false);
    } finally {
      initialized.value = true;
    }
  };

  // actions
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.post("/auth/login", credentials);
      token.value = res.data.token;
      localStorage.setItem("token", token.value);

      await initialize();
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
      router.push("/login");
    } catch (err) {
      error.value = err.response?.data?.message || "Registration failed";
    } finally {
      loading.value = false;
    }
  };

  const logout = (redirect = true) => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    if (redirect) router.push("/login");
  };

  return {
    token,
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
  };
});
