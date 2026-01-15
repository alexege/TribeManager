<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const authStore = useAuthStore()

const profilePicture = ref(authStore.user?.profilePicture || null)
const previewUrl = ref(profilePicture.value || null)
const isUploading = ref(false)
const uploadError = ref('')
const fileInput = ref(null)
const isDragging = ref(false)

// Allowed file types and max size
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase()
})

function validateFile(file) {
  if (!file) {
    return 'No file selected'
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
  }

  if (file.size > MAX_SIZE) {
    return 'File size must be less than 5MB'
  }

  return null
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function processFile(file) {
  uploadError.value = ''

  const error = validateFile(file)
  if (error) {
    uploadError.value = error
    return
  }

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Upload file
  uploadFile(file)
}

async function uploadFile(file) {
  isUploading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('profilePicture', file)

    const { data } = await api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Update local state with returned URL
    profilePicture.value = data.profilePictureUrl
    previewUrl.value = data.profilePictureUrl

    // Update user in auth store if needed
    if (authStore.user) {
      authStore.user.profilePicture = data.profilePictureUrl
    }

  } catch (error) {
    uploadError.value = error.response?.data?.message || 'Failed to upload image'
    // Revert preview on error
    previewUrl.value = profilePicture.value
  } finally {
    isUploading.value = false
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function removeProfilePicture() {
  if (!confirm('Are you sure you want to remove your profile picture?')) {
    return
  }

  isUploading.value = true
  uploadError.value = ''

  try {
    await api.delete('/users/profile-picture')

    profilePicture.value = null
    previewUrl.value = null

    if (authStore.user) {
      authStore.user.profilePicture = null
    }

  } catch (error) {
    uploadError.value = error.response?.data?.message || 'Failed to remove image'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-container">
      <h1 class="dashboard-title">Dashboard</h1>

      <div class="profile-section">
        <h2 class="section-title">Profile Picture</h2>

        <div class="profile-card">
          <!-- Preview Area -->
          <div class="preview-container">
            <div class="avatar-wrapper">
              <div v-if="previewUrl" class="avatar-image-wrapper">
                <img
                  :src="previewUrl"
                  alt="Profile picture"
                  class="avatar-image"
                />
                <div v-if="isUploading" class="upload-overlay">
                  <div class="spinner"></div>
                </div>
              </div>

              <div v-else class="avatar-placeholder">
                <span class="avatar-initials">{{ userInitials }}</span>
              </div>
            </div>

            <div class="user-info">
              <p class="user-email">{{ authStore.user?.email }}</p>
              <p class="user-hint">Upload a profile picture to personalize your account</p>
            </div>
          </div>

          <!-- Upload Area -->
          <div
            class="upload-area"
            :class="{ 'dragging': isDragging, 'has-error': uploadError }"
            @drop.prevent="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              @change="handleFileSelect"
              class="file-input"
            />

            <div class="upload-content">
              <svg
                class="upload-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>

              <p class="upload-text">
                <span class="upload-primary">Click to upload</span>
                <span class="upload-secondary">or drag and drop</span>
              </p>

              <p class="upload-hint">PNG, JPG, WebP or GIF (max. 5MB)</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="uploadError" class="error-message">
            {{ uploadError }}
          </div>

          <!-- Action Buttons -->
          <div v-if="profilePicture" class="action-buttons">
            <button
              @click.stop="triggerFileInput"
              class="btn btn-primary"
              :disabled="isUploading"
            >
              Change Picture
            </button>
            <button
              @click.stop="removeProfilePicture"
              class="btn btn-danger"
              :disabled="isUploading"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
