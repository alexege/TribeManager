<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
const authStore = useAuthStore()

const mode = ref('login')
const loading = ref(false)

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const usernameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Improved regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = {
    minLength: /.{6,}/,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /\d/,
}

// Computed form validity
const isFormValid = computed(() => {
    if (mode.value === 'register') {
        return !usernameError.value &&
               !emailError.value &&
               !passwordError.value &&
               !confirmPasswordError.value &&
               username.value.trim().length >= 3 &&
               email.value &&
               password.value.length >= 6 &&
               confirmPassword.value === password.value
    } else {
        return !emailError.value &&
               !passwordError.value &&
               email.value &&
               password.value.length >= 6
    }
})

function resetErrors() {
    usernameError.value = ''
    emailError.value = ''
    passwordError.value = ''
    confirmPasswordError.value = ''
    // authStore.clearError()
}

function resetFields() {
    username.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    showPassword.value = false
    showConfirmPassword.value = false
    resetErrors()
}

function switchMode(newMode) {
    mode.value = newMode
    resetFields()
}

function forgotPassword() {
    alert('Redirect to forgot password flow')
}

function validateUsername(showError = false) {
    if (mode.value !== 'register') {
        usernameError.value = ''
        return true
    }

    const trimmed = username.value.trim()

    if (!trimmed && !showError) {
        usernameError.value = ''
        return false
    }

    if (!trimmed) {
        usernameError.value = 'Username is required'
        return false
    }

    if (trimmed.length < 3) {
        usernameError.value = 'Username must be at least 3 characters'
        return false
    }

    if (trimmed.length > 20) {
        usernameError.value = 'Username must be less than 20 characters'
        return false
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        usernameError.value = 'Username can only contain letters, numbers, hyphens, and underscores'
        return false
    }

    usernameError.value = ''
    return true
}

function validateEmail(showError = false) {
    const trimmed = email.value.trim()

    if (!trimmed && !showError) {
        emailError.value = ''
        return false
    }

    if (!trimmed) {
        emailError.value = 'Email is required'
        return false
    }

    if (!emailRegex.test(trimmed)) {
        emailError.value = 'Please enter a valid email address'
        return false
    }

    emailError.value = ''
    return true
}

function validatePassword(showError = false) {
    if (!password.value && !showError) {
        passwordError.value = ''
        return false
    }

    if (!password.value) {
        passwordError.value = 'Password is required'
        return false
    }

    if (password.value.length < 6) {
        passwordError.value = 'Password must be at least 6 characters'
        return false
    }

    // Optional: Add stronger password requirements for registration
    if (mode.value === 'register') {
        if (!passwordRegex.hasUpperCase.test(password.value)) {
            passwordError.value = 'Password must contain at least one uppercase letter'
            return false
        }
        if (!passwordRegex.hasLowerCase.test(password.value)) {
            passwordError.value = 'Password must contain at least one lowercase letter'
            return false
        }
        if (!passwordRegex.hasNumber.test(password.value)) {
            passwordError.value = 'Password must contain at least one number'
            return false
        }
    }

    passwordError.value = ''
    return true
}

function validateConfirmPassword(showError = false) {
    if (mode.value !== 'register') {
        confirmPasswordError.value = ''
        return true
    }

    if (!confirmPassword.value && !showError) {
        confirmPasswordError.value = ''
        return false
    }

    if (!confirmPassword.value) {
        confirmPasswordError.value = 'Please confirm your password'
        return false
    }

    if (confirmPassword.value !== password.value) {
        confirmPasswordError.value = 'Passwords do not match'
        return false
    }

    confirmPasswordError.value = ''
    return true
}

// Real-time validation on input (non-intrusive)
watch(username, () => validateUsername(false))
watch(email, () => validateEmail(false))
watch(password, () => {
    validatePassword(false)
    if (confirmPassword.value) {
        validateConfirmPassword(false)
    }
})
watch(confirmPassword, () => validateConfirmPassword(false))

async function submit() {
    // Validate all fields with error display
    const usernameValid = validateUsername(true)
    const emailValid = validateEmail(true)
    const passwordValid = validatePassword(true)
    const confirmValid = validateConfirmPassword(true)

    if (!isFormValid.value) {
        return
    }

    loading.value = true
    try {
        if (mode.value === 'register') {
            await authStore.register({
                username: username.value.trim(),
                email: email.value.trim(),
                password: password.value
            })
            alert('You have successfully registered! Please log in.')
            switchMode('login')
        } else {
            await authStore.login({
                email: email.value.trim(),
                password: password.value
            })
        }
        resetFields()
    } catch (error) {
        // Error is handled by the store and displayed via authStore.error
        console.error('Authentication error:', error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth-wrapper">
        <div class="auth-card">
            <!-- Tabs -->
            <div class="auth-tabs">
                <button :class="['tab', { active: mode === 'login' }]" @click="switchMode('login')">
                    Login
                </button>
                <button :class="['tab', { active: mode === 'register' }]" @click="switchMode('register')">
                    Register
                </button>
                <span class="tab-indicator" :class="mode" />
            </div>

            <!-- Form -->
            <form class="auth-form" @submit.prevent="submit">
                <h2 class="title">{{ mode === 'login' ? 'Welcome Back' : 'Create Account' }}</h2>

                <!-- Server Error Display -->
                <div v-if="authStore.error" class="server-error">
                    {{ authStore.error }}
                </div>

                <!-- Username (Register only) -->
                <div v-if="mode === 'register'" class="field" :class="{ error: usernameError }">
                    <div class="input-wrapper">
                        <span class="icon user-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.86 0-7 3.141-7 7h14c0-3.859-3.14-7-7-7z" />
                            </svg>
                        </span>

                        <input
                            id="username"
                            v-model="username"
                            type="text"
                            placeholder="Username"
                            @blur="validateUsername(true)"
                            :aria-invalid="!!usernameError"
                            :aria-describedby="usernameError ? 'username-error' : null"
                            autocomplete="username" />

                        <label for="username">Username</label>
                    </div>

                    <p v-if="usernameError" id="username-error" class="error-message">
                        {{ usernameError }}
                    </p>
                </div>

                <!-- Email -->
                <div class="field" :class="{ error: emailError }">
                    <div class="input-wrapper">
                        <span class="icon email-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af"
                                viewBox="0 0 24 24">
                                <path d="M12 13.065l-11.72-7.065h23.44l-11.72 7.065zm0 2.935l-12-7v12h24v-12l-12 7z" />
                            </svg>
                        </span>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="Email"
                            @blur="validateEmail(true)"
                            :aria-invalid="!!emailError"
                            :aria-describedby="emailError ? 'email-error' : null"
                            autocomplete="email" />
                        <label for="email">Email</label>
                    </div>
                    <p v-if="emailError" id="email-error" class="error-message">
                        {{ emailError }}
                    </p>
                </div>

                <!-- Password -->
                <div class="field" :class="{ error: passwordError }">
                    <div class="input-wrapper">
                        <span class="icon password-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 17c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm6-9v-2c0-3.314-2.686-6-6-6s-6 2.686-6 6v2h-2v14h16v-14h-2zm-10-2c0-2.206 1.794-4 4-4s4 1.794 4 4v2h-8v-2z" />
                            </svg>
                        </span>
                        <input
                            id="password"
                            :type="showPassword ? 'text' : 'password'"
                            v-model="password"
                            placeholder="Password"
                            @blur="validatePassword(true)"
                            :aria-invalid="!!passwordError"
                            :aria-describedby="passwordError ? 'password-error' : null"
                            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" />
                        <label for="password">Password</label>
                        <button
                            type="button"
                            class="toggle-password"
                            @click="showPassword = !showPassword"
                            :aria-label="showPassword ? 'Hide password' : 'Show password'">
                            {{ showPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                    <p v-if="passwordError" id="password-error" class="error-message">
                        {{ passwordError }}
                    </p>
                </div>

                <!-- Forgot Password (Login Only) -->
                <p v-if="mode === 'login'" class="forgot-password">
                    <a href="#" @click.prevent="forgotPassword">Forgot Password?</a>
                </p>

                <!-- Confirm Password (Register Only) -->
                <div v-if="mode === 'register'" class="field" :class="{ error: confirmPasswordError }">
                    <div class="input-wrapper">
                        <span class="icon password-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 17c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm6-9v-2c0-3.314-2.686-6-6-6s-6 2.686-6 6v2h-2v14h16v-14h-2zm-10-2c0-2.206 1.794-4 4-4s4 1.794 4 4v2h-8v-2z" />
                            </svg>
                        </span>
                        <input
                            id="confirm-password"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            v-model="confirmPassword"
                            placeholder="Confirm Password"
                            @blur="validateConfirmPassword(true)"
                            :aria-invalid="!!confirmPasswordError"
                            :aria-describedby="confirmPasswordError ? 'confirm-error' : null"
                            autocomplete="new-password" />
                        <label for="confirm-password">Confirm Password</label>
                        <button
                            type="button"
                            class="toggle-password"
                            @click="showConfirmPassword = !showConfirmPassword"
                            :aria-label="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'">
                            {{ showConfirmPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                    <p v-if="confirmPasswordError" id="confirm-error" class="error-message">
                        {{ confirmPasswordError }}
                    </p>
                </div>

                <!-- Submit -->
                <button class="submit-btn" :disabled="loading || !isFormValid">
                    <span v-if="loading">Submitting...</span>
                    <span v-else>{{ mode === 'login' ? 'Login' : 'Register' }}</span>
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* =========================
   Layout
========================= */
.auth-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 10vh;
  font-family: system-ui, sans-serif;
  background: var(--bg-main);
}

/* =========================
   Card
========================= */
.auth-card {
  min-width: 360px;
  padding: 2rem;
  border-radius: 16px;

  /* Glass base */
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);

  /* Edge + depth */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.auth-card:focus-within {
  border-color: rgba(255, 69, 15, 0.4);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 69, 15, 0.25),
    0 0 24px rgba(255, 69, 15, 0.15);
}

.auth-tabs {
  background: rgba(10, 10, 10, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* =========================
   Tabs
========================= */
.auth-tabs {
  position: relative;
  display: flex;
  background: var(--alternate-bg-color);
  border-radius: 12px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
  z-index: 1;
}

.tab.active {
  color: var(--text-primary);
}

.tab-indicator {
  position: absolute;
  inset: 0;
  width: 50%;
  background: linear-gradient(
    135deg,
    var(--orange),
    var(--orange-muted)
  );
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.tab-indicator.register {
  transform: translateX(100%);
}

/* =========================
   Form
========================= */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.title {
  color: var(--text-primary);
  text-align: center;
}

/* =========================
   Server Error
========================= */
.server-error {
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}

/* =========================
   Fields / Inputs
========================= */
.field {
  position: relative;
}

.field input {
  width: 100%;
  padding: 1rem 0.9rem;
  padding-left: 2.5rem;
  padding-right: 3rem;
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  box-sizing: border-box;
  color: var(--text-primary);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field.error input {
  border-color: rgba(239, 68, 68, 0.5);
}

.field input::placeholder {
  color: var(--text-muted);
}

.field input:focus {
  border-color: var(--orange);
  box-shadow: 0 0 0 1px var(--orange-muted);
}

.field.error input:focus {
  border-color: rgba(239, 68, 68, 0.7);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.3);
}

.field input:focus::placeholder {
  opacity: 0;
}

/* =========================
   Floating Labels
========================= */
.field label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-input);
  padding: 0 6px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
}

.field input:focus + label,
.field input:not(:placeholder-shown) + label {
  top: -7px;
  opacity: 1;
  color: var(--orange);
}

.field.error input:focus + label,
.field.error input:not(:placeholder-shown) + label {
  color: #ef4444;
}

/* =========================
   Input Wrapper / Icons
========================= */
.input-wrapper {
  position: relative;
}

.input-wrapper .icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.input-wrapper .icon svg {
  fill: var(--text-muted);
}

/* =========================
   Toggle Password
========================= */
.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--orange-soft);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.toggle-password:hover {
  color: var(--orange);
}

/* =========================
   Submit Button
========================= */
.submit-btn {
  margin-top: 1rem;
  padding: 0.9rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    var(--orange),
    var(--orange-muted)
  );
  color: var(--text-primary);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(255, 69, 15, 0.35);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* =========================
   Errors
========================= */
.error-message {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #ef4444;
}

/* =========================
   Forgot Password
========================= */
.forgot-password {
  text-align: center;
  font-size: 0.75rem;
}

.forgot-password a {
  color: var(--orange-soft);
  font-weight: 600;
  text-decoration: none;
}

.forgot-password a:hover {
  color: var(--orange);
  text-decoration: underline;
}
</style>