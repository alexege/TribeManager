import { createRouter, createWebHistory } from "vue-router";

// Views
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Dashboard",
      component: DashboardView,
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "Register",
      component: RegisterView,
    },

    // Example protected route (add later)
    // {
    //   path: '/dashboard',
    //   name: 'Dashboard',
    //   component: () => import('../views/DashboardView.vue'),
    //   meta: { requiresAuth: true }
    // }
  ],
});

// 🔐 Auth Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // If route requires auth and no token → redirect to login
  if (to.meta.requiresAuth && !token) {
    next("/");
  } else {
    next();
  }
});

export default router;
