<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div class="logo">
        <span class="logo-design">Design</span><span class="logo-code">Code</span> <span class="hq">HQ</span>
      </div>
      <div class="user-menu">
        <span v-if="authStore.user">{{ authStore.user.name }}</span>
        <button @click="logout" class="logout-button">退出登录</button>
      </div>
    </header>

    <main class="dashboard-content">
      <h1>欢迎来到 Design+Code HQ</h1>
      <p>您已成功登录到系统</p>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
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

.hq {
  color: #3672F8;
  margin-left: 8px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-button {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dashboard-content {
  flex: 1;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  margin-bottom: 20px;
  color: #212C4F;
}
</style> 