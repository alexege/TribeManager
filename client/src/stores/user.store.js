/* Used to create players for tracking */
// stores/user.store.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("userStore", () => {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /* -------------------------
       FETCH USERS
  ------------------------- */
  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch("/api/users", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      users.value = await res.json();
    } catch (err) {
      error.value = err.message;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  /* -------------------------
       CREATE USER
  ------------------------- */
  const addUser = async (tribeId, data) => {
    error.value = null;

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...data,
        tribeId: tribeId ?? null,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to create user");
    }

    const newUser = await res.json();
    users.value.push(newUser);
    return newUser;
  };

  /* -------------------------
       UPDATE USER
  ------------------------- */
  const updateUser = async (_id, patch) => {
    error.value = null;

    const res = await fetch(`/api/users/${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to update user");
    }

    const updated = await res.json();
    const i = users.value.findIndex((u) => u._id === _id);
    if (i !== -1) users.value[i] = updated;

    return updated;
  };

  /* -------------------------
       DELETE USER
  ------------------------- */
  const deleteUser = async (_id) => {
    error.value = null;

    const res = await fetch(`/api/users/${_id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to delete user");
    }

    users.value = users.value.filter((u) => u._id !== _id);
  };

  /* -------------------------
       DELETE USERS BY TRIBE (LOCAL)
  ------------------------- */
  const removeUsersByTribe = (tribeId) => {
    users.value = users.value.filter((u) => u.tribeId !== tribeId);
  };

  /* -------------------------
       LOOKUPS
  ------------------------- */
  const usersByTribe = (tribeId) =>
    users.value.filter((u) => u.tribeId === tribeId);

  const userCountByTribe = (tribeId) => usersByTribe(tribeId).length;

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    removeUsersByTribe,
    usersByTribe,
    userCountByTribe,
  };
});
