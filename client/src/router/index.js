import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

import AdminDashboard from "../views/AdminDashboard.vue";
import ModerationPanel from "../views/ModerationPanel.vue";
import LoginView from "../views/LoginRegView.vue";
import DashboardView from "../views/DashboardView.vue";
import TribeTrackerView from "../views/TribeTrackerView.vue";
import MapsView from "../views/MapsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // redirect root → login
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/admin",
      component: AdminDashboard,
      meta: {
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "/moderation",
      component: ModerationPanel,
      meta: {
        requiresAuth: true,
        roles: ["admin", "moderator"],
      },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/tracker",
      name: "tracker",
      component: TribeTrackerView,
      meta: { requiresAuth: true },
    },
    {
      path: "/maps",
      name: "maps",
      component: MapsView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.authReady) {
    await auth.authReady();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return "/login";
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return "/dashboard"; // or /403
  }
});

// router.beforeEach((to, from, next) => {
//   const auth = useAuthStore();

//   if (!auth.authReady) {
//     return next(false);
//   }

//   if (to.meta.requiresAuth && !auth.isAuthenticated) {
//     next("/login");
//   }

//   if (to.meta.roles && !to.meta.roles.includes(auth.user.role)) {
//     return next("/dashboard");
//   }

//   next();
// });

export default router;
