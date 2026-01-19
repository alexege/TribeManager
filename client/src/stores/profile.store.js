import { defineStore } from "pinia"
import { ref } from "vue"
import api from "@/services/api"

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useProfileStore = defineStore("profile", () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

    const normalizeProfilePicture = (profileData) => {
    if (profileData?.profilePicture) {
        profileData.profilePicture = `${API_BASE}${profileData.profilePicture}`
    }
    return profileData
    }

  /* -------------------------
     FETCH PROFILE
  ------------------------- */
  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get("/profile/me")
      profile.value = normalizeProfilePicture(data);
      return data
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load profile"
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -------------------------
     UPLOAD PROFILE PICTURE
  ------------------------- */
  const uploadProfilePicture = async (file) => {
    if (!file) throw new Error("No file provided")

    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append("profilePicture", file)

      const { data } = await api.post(
        "/profile/me/profile-picture",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      if (profile.value) {
        profile.value.profilePicture = `${API_BASE}${data.profilePictureUrl}`;
      }

      return `${API_BASE}${data.profilePictureUrl}`

    } catch (err) {
      error.value = err.response?.data?.message || "Upload failed"
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -------------------------
     REMOVE PROFILE PICTURE
  ------------------------- */
  const removeProfilePicture = async () => {
    loading.value = true
    error.value = null

    try {
      await api.delete("/profile/me/profile-picture")

      if (profile.value) {
        profile.value.profilePicture = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to remove picture"
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    uploadProfilePicture,
    removeProfilePicture,
  }
})
