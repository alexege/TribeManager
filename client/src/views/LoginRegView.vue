<template>
    <div class="auth-page">
        <div class="auth-card">
            <header class="auth-header">
                <h1>Welcome back</h1>
                <p>Sign in to your account</p>
            </header>

            <form @submit.prevent="submit">
                <div class="field">
                    <label>Email</label>
                    <input v-model="email" type="email" placeholder="you@example.com" />
                </div>

                <div class="field">
                    <label>Password</label>
                    <input v-model="password" type="password" placeholder="••••••••" />
                </div>

                <button class="primary" :disabled="loading">
                    {{ loading ? 'Signing in…' : 'Sign in' }}
                </button>
            </form>

            <footer class="auth-footer">
                <RouterLink to="/register">Create an account</RouterLink>
            </footer>
        </div>
    </div>
</template>
<style scoped>
.auth-page {
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a, #020617);
}


.auth-card {
    width: 100%;
    max-width: 420px;
    background: #020617;
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}


.auth-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
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
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    color: #cbd5f5;
}


.field input {
    width: 100%;
    padding: 0.75rem 0.9rem;
    border-radius: 10px;
    border: 1px solid #1e293b;
    background: #020617;
    color: white;
    font-size: 0.95rem;
}


.field input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}


button.primary {
    width: 100%;
    margin-top: 1rem;
    padding: 0.8rem;
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


.auth-footer {
    text-align: center;
    margin-top: 1.25rem;
}


.auth-footer a {
    color: #818cf8;
    text-decoration: none;
    font-size: 0.9rem;
}


.auth-footer a:hover {
    text-decoration: underline;
}
</style>