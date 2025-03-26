<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="dashboard-header">
      <div class="logo">
        <span class="logo-design">Design</span>
        <span class="logo-code">Code</span>
        <span class="logo-progress">Progress</span>
        <span class="hq">HQ</span>
      </div>
      <nav class="main-nav">
        <router-link to="/dashboard" class="nav-link">仪表板</router-link>
        <router-link v-if="isAdmin" to="/user-management" class="nav-link">用户管理</router-link>
      </nav>
      <div class="user-menu">
        <span class="user-name">{{ currentUser?.name }}</span>
        <button @click="logout" class="logout-button">退出</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="welcome-section">
        <h1>欢迎回来，{{ currentUser?.name }}！</h1>
        <p class="role-badge" :class="{ admin: isAdmin }">
          {{ isAdmin ? '管理员' : '普通用户' }}
        </p>
      </div>

      <div class="dashboard-grid">
        <!-- 快速统计 -->
        <div class="stat-card">
          <h3>在线用户</h3>
          <div class="stat-value">{{ onlineUsers }}</div>
        </div>

        <div class="stat-card">
          <h3>总用户数</h3>
          <div class="stat-value">{{ totalUsers }}</div>
        </div>

        <div class="stat-card">
          <h3>今日活跃</h3>
          <div class="stat-value">{{ activeUsers }}</div>
        </div>

        <!-- 快速操作 -->
        <div class="action-card">
          <h3>快速操作</h3>
          <div class="action-buttons">
            <button v-if="isAdmin" @click="$router.push('/user-management')" class="action-button">
              管理用户
            </button>
            <button @click="updateProfile" class="action-button">
              更新个人信息
            </button>
            <button @click="changePassword" class="action-button">
              修改密码
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div class="modal" v-if="showPasswordModal">
      <div class="modal-content">
        <h2>修改密码</h2>
        <form @submit.prevent="handlePasswordChange">
          <div class="form-group">
            <label>当前密码</label>
            <input v-model="passwordForm.currentPassword" type="password" required placeholder="请输入当前密码" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="passwordForm.newPassword" type="password" required placeholder="请输入新密码" />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" required placeholder="请再次输入新密码" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="submit-button">
              确认修改
            </button>
            <button type="button" @click="showPasswordModal = false" class="cancel-button">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();

const currentUser = computed(() => authStore.user);
const isAdmin = computed(() => currentUser.value?.role === 'admin');

// 模拟数据
const onlineUsers = ref(42);
const totalUsers = ref(156);
const activeUsers = ref(78);

const showPasswordModal = ref(false);
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

function logout() {
  authStore.logout();
  router.push('/login');
}

function updateProfile() {
  // TODO: 实现更新个人信息功能
  alert('更新个人信息功能即将上线');
}

function changePassword() {
  showPasswordModal.value = true;
}

async function handlePasswordChange() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('两次输入的新密码不一致');
    return;
  }

  try {
    await axios.post('/api/users/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    });

    alert('密码修改成功');
    showPasswordModal.value = false;
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error: any) {
    alert(error.response?.data?.message || '密码修改失败');
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.dashboard-header {
  background-color: #212C4F;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}

.logo-design {
  color: white;
}

.logo-code {
  background: linear-gradient(to right, #4899F7, #2457F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.logo-progress {
  background: linear-gradient(to right, #9DE1E5, #B8DFB2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hq {
  color: #3672F8;
  margin-left: 4px;
}

.main-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-name {
  font-weight: 500;
}

.logout-button {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
}

.welcome-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.welcome-section h1 {
  margin: 0;
  color: #212529;
  font-size: 28px;
}

.role-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.role-badge.admin {
  background-color: #339af0;
  color: white;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card,
.action-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3,
.action-card h3 {
  margin: 0 0 15px;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #212529;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-button {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  background-color: #e9ecef;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
}

.modal-content h2 {
  margin: 0 0 20px;
  color: #212529;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.submit-button {
  background-color: #56CCF2;
  color: white;
}

.cancel-button {
  background-color: #e9ecef;
  color: #495057;
}
</style>