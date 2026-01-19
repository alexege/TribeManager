<script setup>
import { ref, computed, onBeforeUnmount } from "vue"
import { useProfileStore } from "@/stores/profile.store"
import { useAuthStore } from "@/stores/auth.store"

const emit = defineEmits(["close"])

const profileStore = useProfileStore()
const authStore = useAuthStore()

/* -------------------------
   STATE
------------------------- */
const selectedFile = ref(null)
const localPreviewUrl = ref(null)
const isUploading = ref(false)
const uploadError = ref("")
const fileInput = ref(null)
const isDragging = ref(false)

/* -------------------------
   CONSTANTS
------------------------- */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/* -------------------------
   COMPUTED
------------------------- */
const profilePicture = computed(
  () => profileStore.profile?.profilePicture || null
)

const displayImage = computed(
  () => localPreviewUrl.value || profilePicture.value
)

const userInitials = computed(
  () => authStore.user?.email?.charAt(0).toUpperCase() || "?"
)

/* -------------------------
   HELPERS
------------------------- */
function validateFile(file) {
  if (!file) return "No file selected"
  if (!ALLOWED_TYPES.includes(file.type))
    return "Invalid image type"
  if (file.size > MAX_SIZE)
    return "Max file size is 5MB"
  return null
}

/* -------------------------
   FILE HANDLING
------------------------- */
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

function handleDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

/* -------------------------
   CORE LOGIC
------------------------- */
function processFile(file) {
  uploadError.value = ""

  const error = validateFile(file)
  if (error) {
    uploadError.value = error
    return
  }

  cleanupPreview()

  selectedFile.value = file
  localPreviewUrl.value = URL.createObjectURL(file)
}

async function saveProfilePicture() {
  if (!selectedFile.value) return

  isUploading.value = true
  uploadError.value = ""

  try {
    const fullUrl = await profileStore.uploadProfilePicture(
      selectedFile.value
    )

    // Sync header/avatar immediately
    authStore.updateAvatar(fullUrl)

    cleanupPreview()
  } catch {
    uploadError.value =
      profileStore.error || "Failed to upload image"
  } finally {
    isUploading.value = false
  }
}

function cancelPreview() {
  cleanupPreview()
  uploadError.value = ""
}

async function removeProfilePicture() {
  if (!confirm("Remove profile picture?")) return

  isUploading.value = true

  try {
    await profileStore.removeProfilePicture()
    authStore.updateAvatar(null)
  } finally {
    isUploading.value = false
  }
}

function cleanupPreview() {
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value)
  }

  localPreviewUrl.value = null
  selectedFile.value = null
}

/* -------------------------
   LIFECYCLE
------------------------- */
onBeforeUnmount(cleanupPreview)
</script>

<template>
  <div class="profile-section">
    <div class="profile-card">
      <span
        class="material-symbols-outlined exit"
        @click="emit('close')"
      >
        close
      </span>

      <h2 class="section-title">Profile Picture</h2>

      <!-- Preview -->
      <div class="preview-container">
        <div class="avatar-wrapper">
          <div v-if="displayImage" class="avatar-image-wrapper">
            <img
              :src="displayImage"
              alt="Profile picture"
              class="avatar-image"
            />
            <div v-if="isUploading" class="upload-overlay">
              <div class="spinner"></div>
            </div>
          </div>

          <div v-else class="avatar-placeholder">
            <span class="avatar-initials">
              {{ userInitials }}
            </span>
          </div>
        </div>

        <div class="user-info">
          <p class="user-email">
            {{ authStore.user?.email }}
          </p>
          <p class="user-hint">
            Upload a profile picture to personalize your account
          </p>
        </div>
      </div>

      <!-- Upload Area -->
      <div
        class="upload-area"
        :class="{ dragging: isDragging, 'has-error': uploadError }"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          class="file-input"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @change="handleFileSelect"
        />

        <div class="upload-content">
          <p class="upload-primary">Click to upload</p>
          <p class="upload-secondary">
            or drag and drop
          </p>
          <p class="upload-hint">
            PNG, JPG, WebP or GIF (max. 5MB)
          </p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="uploadError" class="error-message">
        {{ uploadError }}
      </div>

      <!-- Actions -->
      <div class="action-buttons">
        <template v-if="localPreviewUrl">
          <button
            class="btn btn-primary"
            :disabled="isUploading"
            @click="saveProfilePicture"
          >
            Save
          </button>

          <button
            class="btn btn-danger"
            :disabled="isUploading"
            @click="cancelPreview"
          >
            Cancel
          </button>
        </template>

        <template v-else-if="profilePicture">
          <button
            class="btn btn-danger"
            :disabled="isUploading"
            @click="removeProfilePicture"
          >
            Remove
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exit {
    position: absolute;
    top: 0;
    right: 0;
    padding: .5em;
    cursor: pointer;
    color: var(--primary-color);
}

.exit:hover {
    color: var(--text-primary);
}

.profile-section {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dashboard-wrapper {
  min-height: 100vh;
  background: var(--bg-main);
  padding: 2rem;
}

.dashboard-container {
  max-width: 800px;
  margin: 0 auto;
}

.dashboard-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.profile-section {
  margin-bottom: 2rem;
}

.section-title {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Profile Card */
.profile-card {
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

/* Preview Container */
.preview-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--orange);
  box-shadow: 0 4px 12px rgba(255, 69, 15, 0.3);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--orange), var(--orange-muted));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.avatar-initials {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.user-info {
  flex: 1;
}

.user-email {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-hint {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Upload Area */
.upload-area {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(10, 10, 10, 0.3);
}

.upload-area:hover {
  border-color: var(--orange);
  background: rgba(255, 69, 15, 0.05);
}

.upload-area.dragging {
  border-color: var(--orange);
  background: rgba(255, 69, 15, 0.1);
  transform: scale(1.02);
}

.upload-area.has-error {
  border-color: rgba(239, 68, 68, 0.5);
}

.file-input {
  display: none;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  color: var(--orange);
  margin: 0 auto 1rem;
}

.upload-text {
  margin-bottom: 0.5rem;
}

.upload-primary {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.upload-secondary {
  display: block;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.upload-hint {
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Error Message */
.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, var(--orange), var(--orange-muted));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(255, 69, 15, 0.3);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--orange);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .dashboard-wrapper {
    padding: 1rem;
  }

  .preview-container {
    flex-direction: column;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
