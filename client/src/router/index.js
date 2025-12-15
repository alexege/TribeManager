import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    {
      path: "/dashboard",
      name: "Dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    // redirect root → login
    {
      path: "/",
      redirect: "/login",
    },
  ],
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (!auth.initialized) {
    next(false);
    return;
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
