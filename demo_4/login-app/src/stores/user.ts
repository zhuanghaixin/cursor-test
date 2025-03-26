import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  // 获取所有用户
  async function fetchUsers() {
    loading.value = true;
    try {
      const response = await axios.get('/api/users');
      users.value = response.data;
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      loading.value = false;
    }
  }

  // 创建用户
  async function createUser(userData: CreateUserData) {
    try {
      const response = await axios.post('/api/users', userData);
      users.value.push(response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  // 更新用户
  async function updateUser(userData: UpdateUserData) {
    try {
      const response = await axios.put(`/api/users/${userData.id}`, userData);
      const index = users.value.findIndex(u => u.id === userData.id);
      if (index !== -1) {
        users.value[index] = response.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  // 删除用户
  async function deleteUser(userId: string) {
    try {
      await axios.delete(`/api/users/${userId}`);
      users.value = users.value.filter(u => u.id !== userId);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
}); 