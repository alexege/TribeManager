/* Used to create login users and manage authentication */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
  // ─────────────
  // STATE
  // ─────────────
  const token = ref(localStorage.getItem("token"));
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // 👇 THIS is the missing piece
  const authReady = ref(false);

  // ─────────────
  // GETTERS
  // ─────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const isModerator = computed(() =>
    ["admin", "moderator"].includes(user.value?.role)
  );

  // ─────────────
  // ACTIONS
  // ─────────────
  const checkAuth = async () => {
    if (authReady.value) return;

    try {
      if (!token.value) return;

      // Try refreshing token first
      const refresh = await api.post("/auth/refresh");
      token.value = refresh.data.token;
      localStorage.setItem("token", token.value);

      // Fetch user
      const res = await api.get("/auth/me");
      user.value = res.data;
    } catch {
      await logout(false);
    } finally {
      authReady.value = true;
    }
  };

  // 🔁 Restore session on full page refresh
  const restoreSession = async () => {
    try {
      if (!token.value) return;

      // 1️⃣ Refresh access token
      const refresh = await api.post("/auth/refresh");
      token.value = refresh.data.token;
      localStorage.setItem("token", token.value);

      // 2️⃣ Fetch user
      const res = await api.get("/auth/me");
      user.value = res.data;
    } catch {
      await logout(false);
    } finally {
      authReady.value = true;
    }
  };

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      // 1️⃣ Login
      const res = await api.post("/auth/login", credentials);
      token.value = res.data.token;
      localStorage.setItem("token", token.value);

      // 2️⃣ Fetch user
      const me = await api.get("/auth/me");
      user.value = me.data;

      router.push("/dashboard");
    } catch (err) {
      error.value = err.response?.data?.message || "Login failed";
    } finally {
      loading.value = false;
      authReady.value = true;
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

  const logout = async (redirect = true) => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors
    }

    token.value = null;
    user.value = null;
    localStorage.removeItem("token");

    if (redirect) {
      router.push("/login");
    }
  };

  return {
    // state
    token,
    user,
    loading,
    error,
    authReady,

    // getters
    isAuthenticated,
    isAdmin,
    isModerator,

    // actions
    checkAuth,
    restoreSession,
    login,
    register,
    logout,
  };
});
