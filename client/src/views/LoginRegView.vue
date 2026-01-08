<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
const authStore = useAuthStore()

const mode = ref('login')
const loading = ref(false)

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const usernameError = ref(false)
const emailError = ref(false)
const passwordError = ref(false)
const confirmPasswordError = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Regex for basic email validation
const emailRegex = /\S+@\S+\.\S+/

function resetErrors() {
    usernameError.value = false
    emailError.value = false
    passwordError.value = false
    confirmPasswordError.value = false
}

function resetFields() {
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
    alert('Redirect to forgot password flow');
}

function validateUsername() {
    if (mode.value !== 'register') {
        usernameError.value = false
        return
    }

    if (!username.value) {
        usernameError.value = false
        return
    }

    usernameError.value = username.value.trim().length < 3
}

watch([username, mode], validateUsername)

function validateEmail() {
    if (!email.value) {
        emailError.value = false; // clear error if empty
        return;
    }
    emailError.value = !emailRegex.test(email.value)
}

function validatePassword() {
    if (!password.value) {
        passwordError.value = false;
        return;
    }

    passwordError.value = password.value.length < 6
}

function validateConfirmPassword() {
    if (!confirmPassword.value) {
        confirmPasswordError.value = false;
        return;
    }

    if (mode.value === 'register') {
        confirmPasswordError.value = confirmPassword.value !== password.value
    } else {
        confirmPasswordError.value = false
    }
}

// Watch for real-time validation
watch([password, confirmPassword], () => {
    validatePassword()
    validateConfirmPassword()
})

watch(email, validateEmail)

async function submit() {
    resetErrors()
    validateUsername()
    validateEmail()
    validatePassword()
    validateConfirmPassword()

    if (usernameError.value || emailError.value || passwordError.value || confirmPasswordError.value) return

    loading.value = true
    try {
        if (mode.value === 'register') {
            await authStore.register({
                username: username.value,
                email: email.value,
                password: password.value
            })
                .then(() => {
                    alert('You have successfully registered! Please log in.');
                    switchMode('login');
                })
        } else {
            await authStore.login({
                email: email.value,
                password: password.value
            })
        }
        resetFields()
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

                <div v-if="mode === 'register'" class="field" :class="{ error: usernameError }">
                    <div class="input-wrapper">
                        <span class="icon user-icon">
                            <!-- User SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.86 0-7 3.141-7 7h14c0-3.859-3.14-7-7-7z" />
                            </svg>
                        </span>

                        <input id="username" v-model="username" type="text" placeholder="Username"
                            @blur="validateUsername" @input="validateUsername" :aria-invalid="usernameError"
                            :aria-describedby="usernameError ? 'username-error' : null" />

                        <label for="username">Username</label>
                    </div>

                    <p v-if="usernameError" id="username-error" class="error-message">
                        Username must be at least 3 characters
                    </p>
                </div>

                <!-- Email -->
                <div class="field" :class="{ error: emailError, filled: email }">
                    <div class="input-wrapper">
                        <span class="icon email-icon">
                            <!-- Email SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af"
                                viewBox="0 0 24 24">
                                <path d="M12 13.065l-11.72-7.065h23.44l-11.72 7.065zm0 2.935l-12-7v12h24v-12l-12 7z" />
                            </svg>
                        </span>
                        <input v-model="email" type="email" placeholder="Email" @blur="validateEmail"
                            @input="validateEmail" :aria-invalid="emailError"
                            :aria-describedby="emailError ? 'email-error' : null" />
                        <label>Email</label>
                    </div>
                    <p v-if="emailError" id="email-error" class="error-message">
                        Please enter a valid email
                    </p>
                </div>

                <!-- Password -->
                <div class="field" :class="{ error: passwordError, filled: password }">
                    <div class="input-wrapper">
                        <span class="icon password-icon">
                            <!-- Lock SVG -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9ca3af"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12 17c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm6-9v-2c0-3.314-2.686-6-6-6s-6 2.686-6 6v2h-2v14h16v-14h-2zm-10-2c0-2.206 1.794-4 4-4s4 1.794 4 4v2h-8v-2z" />
                            </svg>
                        </span>
                        <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password"
                            @blur="validatePassword" @input="validatePassword" :aria-invalid="passwordError"
                            :aria-describedby="passwordError ? 'password-error' : null" />
                        <label>Password</label>
                        <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                            {{ showPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                    <p v-if="passwordError" id="password-error" class="error-message">
                        Must be at least 6 characters
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
                        <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword"
                            placeholder="Confirm Password" @blur="validateConfirmPassword"
                            @input="validateConfirmPassword" :aria-invalid="confirmPasswordError"
                            :aria-describedby="confirmPasswordError ? 'confirm-error' : null" />
                        <label>Confirm Password</label>
                        <button type="button" class="toggle-password"
                            @click="showConfirmPassword = !showConfirmPassword">
                            {{ showConfirmPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                    <p v-if="confirmPasswordError" id="confirm-error" class="error-message">
                        Passwords do not match
                    </p>
                </div>

                <!-- Submit -->
                <button class="submit-btn" :disabled="loading">
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
/* .auth-card {
  min-width: 360px;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
} */

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

.field input::placeholder {
  color: var(--text-muted);
}

.field input:focus {
  border-color: var(--orange);
  box-shadow: 0 0 0 1px var(--orange-muted);
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
  color: var(--orange-soft);
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
