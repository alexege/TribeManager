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
.auth-wrapper {
    flex: 1;
    margin-top: 10vh;
    /* background: radial-gradient(circle at top, #1e1e2f, #0f0f18); */
    font-family: system-ui, sans-serif;
}

.auth-card {
    min-width: 360px;
    background: #111827;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

/* Tabs */
.auth-tabs {
    position: relative;
    display: flex;
    background: #0b1220;
    border-radius: 12px;
    margin-bottom: 2rem;
    overflow: hidden;
}

.tab {
    flex: 1;
    padding: 0.75rem;
    background: none;
    border: none;
    color: #9ca3af;
    font-weight: 600;
    cursor: pointer;
    z-index: 1;
}

.tab.active {
    color: #fff;
}

.tab-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 12px;
    transition: transform 0.3s ease, background 0.3s ease;
}

.tab-indicator.register {
    transform: translateX(100%);
}

/* Form */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.title {
    color: #fff;
    text-align: center;
    margin-bottom: 0.5rem;
}

/* Floating inputs */
.field {
    position: relative;
}

/* Input */
.field input {
    width: 100%;
    padding: 1rem 0.9rem;
    background: #020617;
    border: 1px solid #1f2937;
    border-radius: 12px;
    box-sizing: border-box;
    color: #fff;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s ease;
}

.field input:focus {
    border-color: #8b5cf6;
}

/* Placeholder styling */
.field input::placeholder {
    color: #6b7280;
    transition: opacity 0.2s ease;
}

/* Fade placeholder when focused */
.field input:focus::placeholder {
    opacity: 0;
}

/* Label (starts hidden, sitting over placeholder) */
.field label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    color: #9ca3af;
    pointer-events: none;
    padding: 0 6px;
    background: #020617;
    opacity: 0;
    transition: all 0.25s ease;
}

/* Show + float label on focus */
.field input:focus+label {
    top: -7px;
    font-size: 0.7rem;
    opacity: 1;
    color: #8b5cf6;
}

/* Keep label floated when input has value */
.field input:not(:placeholder-shown)+label {
    top: -7px;
    font-size: 0.7rem;
    opacity: 1;
    color: #a78bfa;
}

/* Empty + blurred → hide label again */
.field input:placeholder-shown:not(:focus)+label {
    opacity: 0;
}

/* Wrap input and button together */
.input-wrapper {
    position: relative;
    width: 100%;
}

/* Make input leave space for the toggle button */
.input-wrapper input {
    width: 100%;
    padding-right: 3rem;
    /* space for button */
    box-sizing: border-box;
}

/* Toggle button */
.toggle-password {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a78bfa;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 2;
    /* keep above input */
}

/* Button */
.submit-btn {
    margin-top: 1rem;
    padding: 0.9rem;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
}

.submit-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* Field Errors */
/* Animate error messages */
.error-message {
    margin-top: 6px;
    font-size: 0.75rem;
    color: #ef4444;
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: opacity 0.3s ease, max-height 0.3s ease;
}

.field.error .error-message {
    opacity: 1;
    max-height: 50px;
    /* enough for one line of text */
}

/* Submit button hover and press animation */
.submit-btn {
    margin-top: 1rem;
    padding: 0.9rem;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, #7c3aed, #a78bfa);
}

.submit-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

.submit-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* Add toggle password button styling */
.toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a78bfa;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
}

/* Icons inside inputs */
.input-wrapper .icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
}

/* Add padding so text doesn’t overlap icons */
.input-wrapper input {
    padding-left: 2.5rem;
    /* space for icon */
}

/* Forgot password link */
.forgot-password {
    text-align: center;
    margin-top: -0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
}

.forgot-password a {
    color: #8b5cf6;
    text-decoration: none;
    font-weight: 600;
}

.forgot-password a:hover {
    text-decoration: underline;
}
</style>
