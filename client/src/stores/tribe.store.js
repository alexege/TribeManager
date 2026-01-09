// stores/tribe.store.js
import { defineStore } from "pinia";
import { ref } from "vue";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const useTribeStore = defineStore("tribeStore", () => {
  const tribes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /* -------------------------
        FETCH TRIBES FROM DB
    ------------------------- */
  const fetchTribes = async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch("/api/tribes", {
        credentials: "include", // for cookies
      });

      if (!res.ok) throw new Error("Failed to fetch tribes");

      tribes.value = await res.json(); // assumes MongoDB _id is used
    } catch (err) {
      error.value = err.message;
      console.log(err);
    } finally {
      loading.value = false;
    }
  };

  /* -------------------------
        CREATE A TRIBE
    ------------------------- */
  const addTribe = async (name) => {
    error.value = null;

    const res = await fetch("/api/tribes", {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to create tribe");
    }

    const newTribe = await res.json();
    tribes.value.push(newTribe);
    return newTribe;
  };

  /* -------------------------
        UPDATE TRIBE
    ------------------------- */
  const updateTribe = async (id, patch) => {
    error.value = null;

    const res = await fetch(`/api/tribes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to update tribe");
    }

    const updated = await res.json();
    const i = tribes.value.findIndex((t) => t._id === id);
    if (i !== -1) tribes.value[i] = updated;

    return updated;
  };

  /* -------------------------
        DELETE TRIBE
    ------------------------- */
  const deleteTribe = async (id) => {
    error.value = null;

    const res = await fetch(`/api/tribes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to delete tribe");
    }

    tribes.value = tribes.value.filter((t) => t._id !== id);
  };

  return {
    tribes,
    loading,
    error,
    fetchTribes,
    addTribe,
    updateTribe,
    deleteTribe,
  };
});
