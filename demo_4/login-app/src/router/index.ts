import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import UserManagementView from '@/views/UserManagementView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { requiresGuest: true }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagementView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated()
  const isAdmin = authStore.user?.role === 'admin'

  // 需要登录的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // 需要管理员权限的页面
  if (to.meta.requiresAdmin && !isAdmin) {
    next('/dashboard')
    return
  }

  // 已登录用户不能访问的页面（如登录、注册页）
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router
