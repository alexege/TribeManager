<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

const submit = () => {
    localError.value = ''

    if (password.value !== confirmPassword.value) {
        localError.value = 'Passwords do not match'
        return
    }

    auth.register({
        email: email.value,
        password: password.value
    })
}
</script>
<template>
    <div class="auth-page">
        <div class="auth-card">
            <header class="auth-header">
                <h1>Create account</h1>
                <p>Join us in under a minute</p>
            </header>

            <form @submit.prevent="submit">
                <div class="field">
                    <label>Email</label>
                    <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" required />
                </div>

                <div class="field">
                    <label>Password</label>
                    <input v-model="password" type="password" placeholder="••••••••" autocomplete="new-password"
                        required />
                </div>

                <div class="field">
                    <label>Confirm password</label>
                    <input v-model="confirmPassword" type="password" placeholder="••••••••" autocomplete="new-password"
                        required />
                </div>

                <p v-if="localError" class="error">{{ localError }}</p>
                <p v-if="auth.error" class="error">{{ auth.error }}</p>

                <button class="primary" :disabled="auth.loading">
                    {{ auth.loading ? 'Creating account…' : 'Register' }}
                </button>
            </form>

            <footer class="auth-footer">
                <RouterLink to="/">Already have an account?</RouterLink>
            </footer>
        </div>
    </div>
</template>
<style scoped>
.auth-page {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a, #020617);
}

.auth-card {
    width: 100%;
    max-width: 420px;
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
    animation: fadeUp 0.35s ease-out;
    margin: 0 auto;
}

.auth-header h1 {
    font-size: 1.8rem;
    margin-bottom: 0.25rem;
    color: white;
}

.auth-header p {
    color: #94a3b8;
    margin-bottom: 1.5rem;
}

.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    font-size: 0.8rem;
    margin-bottom: 0.35rem;
    color: #cbd5f5;
}

.field input {
    width: 100%;
    padding: 0.75rem 0.9rem;
    border-radius: 10px;
    border: 1px solid #1e293b;
    background: #020617;
    color: white;
}

.field input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

button.primary {
    width: 100%;
    margin-top: 1rem;
    padding: 0.85rem;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
    font-weight: 600;
    border: none;
    cursor: pointer;
}

button.primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error {
    color: #f87171;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.auth-footer {
    text-align: center;
    margin-top: 1.25rem;
}

.auth-footer a {
    color: #818cf8;
    font-size: 0.9rem;
    text-decoration: none;
}

.auth-footer a:hover {
    text-decoration: underline;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>