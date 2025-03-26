import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import UserManagementView from '@/views/UserManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagementView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// 导航守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 如果路由需要认证
  if (requiresAuth) {
    // 检查是否已登录
    if (!authStore.token) {
      // 未登录，重定向到登录页
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    try {
      // 验证 token 是否有效
      await authStore.fetchCurrentUser()
      next()
    } catch (error) {
      // token 无效，重定向到登录页
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  } else {
    // 不需要认证的路由
    if (authStore.token && (to.name === 'login' || to.name === 'register')) {
      // 已登录用户访问登录/注册页，重定向到用户管理页
      next({ name: 'user-management' })
      return
    }
    next()
  }
})

export default router
