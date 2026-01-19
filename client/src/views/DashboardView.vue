<script setup>
import { ref, computed, onMounted } from "vue"
import { useAuthStore } from "@/stores/auth.store"
import { useProfileStore } from "@/stores/profile.store"
import ProfilePictureModal from "@/components/modals/ProfilePictureModal.vue"

const authStore = useAuthStore()
const profileStore = useProfileStore()

const showProfileModal = ref(false)

/* -------------------------
   COMPUTED
------------------------- */
const profilePicture = computed(
  () => profileStore.profile?.profilePicture || null
)

const fullProfilePictureUrl = computed(() => {
  const pic = profileStore.profile?.profilePicture
  if (!pic) return null

  // if (!profilePicture.value) return null
  // return `${import.meta.env.VITE_API_URL}${profilePicture.value}`
  return pic.startsWith("http") ? pic : `${import.meta.env.VITE_API_URL}${pic}`
})

const userInitials = computed(() =>
  authStore.activeUser?.email?.charAt(0).toUpperCase() || "?"
)

/* -------------------------
   LIFECYCLE
------------------------- */
onMounted(() => {
  if (!profileStore.profile) {
    profileStore.fetchProfile()
  }
})

const ROLE_LABELS = {
  ROLE_ADMIN: "Admin",
  ROLE_MODERATOR: "Moderator",
  ROLE_USER: "User",
}

const readableRoles = computed(() => {
  return authStore.activeUser?.roles
  ?.map(role => ROLE_LABELS[role])
  .filter(Boolean)
  .join(", ");
})
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-container">
      <h1 class="dashboard-title">Dashboard</h1>

      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-wrapper" @click="showProfileModal = true">
            <img
              v-if="fullProfilePictureUrl"
              :src="fullProfilePictureUrl"
              class="avatar-image"
              alt="Profile picture"
            />

            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>

            <div class="avatar-overlay">
              Change
            </div>
          </div>

          <div class="profile-meta">
            <h2 class="profile-name">
              {{ authStore.activeUser?.name || "Anonymous User" }}
            </h2>
            <p class="profile-email">
              {{ authStore.activeUser?.email }}
            </p>
            <p class="profile-role">Roles:
              {{ readableRoles || "User" }}
            </p>
          </div>
        </div>

        <!-- Details -->
        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">User ID</span>
            <span class="detail-value">
              {{ authStore.activeUser?._id }}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Joined</span>
            <span class="detail-value">
              {{
                new Date(authStore.activeUser?.createdAt).toLocaleDateString()
              }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Picture Modal -->
    <ProfilePictureModal
      v-if="showProfileModal"
      @close="showProfileModal = false"
    />
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background: var(--bg-main);
  padding: 2rem;
}

.dashboard-container {
  max-width: 900px;
  margin: 0 auto;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

/* Profile Card */
.profile-card {
  background: rgba(18, 18, 18, 0.75);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  outline: 1px solid var(--primary-color);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Avatar */
.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--orange),
    var(--orange-muted)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

/* Meta */
.profile-meta {
  flex: 1;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.profile-email {
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.profile-role {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--orange);
}

/* Details */
.profile-details {
  margin-top: 2rem;
  border-top: 1px solid var(--primary-color);
  padding-top: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail-label {
  color: var(--text-muted);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 640px) {
  .profile-header {
    flex-direction: colum;
    text-align: center;
  }
}
</style>