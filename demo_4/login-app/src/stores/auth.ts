import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

// 定义用户接口
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);

  // 从本地存储初始化状态
  function initializeStore() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken) {
      token.value = savedToken;
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }

  // 设置认证令牌
  function setToken(newToken: string | null) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // 登录
  async function login(credentials: LoginData) {
    loading.value = true;
    console.log('credentials', credentials)
    try {
      const response = await axios.post('/api/auth/login', credentials);
      console.log('response', response)
      setToken(response.data.token);
      user.value = response.data.user;
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      loading.value = false;
    }
  }

  // 注册
  async function register(data: RegisterData) {
    try {
      const response = await axios.post('/api/auth/register', data);
      setToken(response.data.token);
      user.value = response.data.user;
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // 请求密码重置
  async function requestPasswordReset(email: string) {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      throw new Error(error.response?.data?.message || 'Password reset request failed');
    }
  }

  // 重置密码
  async function resetPassword(token: string, newPassword: string) {
    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password: newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('Password reset failed:', error);
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  // 登出
  function logout() {
    user.value = null;
    setToken(null);
  }

  // 获取当前用户信息
  async function fetchCurrentUser() {
    if (!token.value) return null;
    
    try {
      const response = await axios.get('/api/auth/me');
      user.value = response.data;
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      if (error.response?.status === 401) {
        logout();
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  // 检查是否已认证
  function isAuthenticated() {
    return !!token.value;
  }

  return {
    user,
    token,
    loading,
    login,
    register,
    requestPasswordReset,
    resetPassword,
    logout,
    fetchCurrentUser,
    isAuthenticated,
    initializeStore
  };
}); 