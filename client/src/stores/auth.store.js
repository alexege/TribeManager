/* Used to create login user and manage authentication */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import router from "../router";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useAuthStore = defineStore("auth", () => {
  // ─────────────
  // STATE
  // ─────────────
  const token = ref(localStorage.getItem("token") || null);
  const activeUser = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // 👇 THIS is the missing piece
  const authReady = ref(false);

  // ─────────────
  // GETTERS
  // ─────────────
  const isAuthenticated = computed(() => !!token.value && !!activeUser.value);
  const isAdmin = computed(() => activeUser.value?.role === "ROLE_ADMIN");
  const isModerator = computed(() =>
    ["ROLE_ADMIN", "ROLE_MODERATOR"].includes(activeUser.value?.role)
  );

  // ─────────────
  // ACTIONS
  // ─────────────
  const normalizeUser = (user) => {
    if (!user) return null;

    if (user.profilePicture) {
      user.avatarUrl = `${API_BASE}${user.profilePicture}`;
    } else {
      user.avatarUrl = null;
    }

    return user;
  };

  const checkAuth = async () => {
    if (authReady.value) return;

    try {
      if (!token.value) return;

      // Try refreshing token first
      const refresh = await api.post("/auth/refresh");
      token.value = refresh.data.token;
      localStorage.setItem("token", token.value);

      // Fetch activeUser
      const res = await api.get("/auth/me");
      activeUser.value = normalizeUser(res.data);
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

      // 2️⃣ Fetch activeUser
      const res = await api.get("/auth/me");
      activeUser.value = normalizeUser(res.data);
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

      // 2️⃣ Fetch activeUser
      const me = await api.get("/auth/me");
      activeUser.value = normalizeUser(me.data);

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
    activeUser.value = null;
    localStorage.removeItem("token");

    if (redirect) {
      router.push("/login");
    }
  };

  const updateAvatar = (avatarUrl) => {
  if (activeUser.value) {
    activeUser.value.avatarUrl = avatarUrl;
  }
  };

  return {
    // state
    token,
    activeUser,
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
    updateAvatar
  };
});
