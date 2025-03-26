import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// 创建 Pinia 存储
const pinia = createPinia()

// 配置 axios 默认设置
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
axios.defaults.withCredentials = true

// 创建应用实例
const app = createApp(App)

app.use(pinia)
app.use(router)

// 初始化认证状态
const authStore = useAuthStore()
authStore.initializeStore()

// 挂载应用
app.mount('#app')
