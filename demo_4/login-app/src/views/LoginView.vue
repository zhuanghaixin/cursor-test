<template>
  <div class="login-container">
    <div class="form-container">
      <!-- Logo部分 -->
      <div class="logo">
        <div class="logo-design">Design</div>
        <div class="logo-code">Code</div>
        <div class="logo-progress">Progress</div>
        <div class="hq">HQ</div>
      </div>

      <!-- 标题 -->
      <h1 class="title">Sign into Design+Code HQ</h1>

      <!-- 表单 -->
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input type="email" v-model="email" placeholder="Email" required class="input-field" />
        </div>

        <div class="input-group">
          <input type="password" v-model="password" placeholder="Password" required class="input-field" />
        </div>

        <div class="forgot-password">
          <a href="#" @click.prevent="forgotPassword">Forgotten your password?</a>
        </div>

        <button type="submit" class="sign-in-button" :disabled="isLoading">
          <span v-if="!isLoading">Sign In</span>
          <span v-else>Loading...</span>
        </button>
      </form>

      <!-- 注册提示 -->
      <div class="register-container">
        <p class="register-text">Don't have a Design+Code HQ account?</p>
        <a href="#" @click.prevent="requestAccount" class="request-account">Request an account</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref('');

async function handleLogin() {
  isLoading.value = true;
  error.value = '';

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
    router.push('/dashboard');
  } catch (err: any) {
    error.value = err.message || 'Failed to login';
  } finally {
    isLoading.value = false;
  }
}

function forgotPassword() {
  // 实现忘记密码逻辑
  alert('Forgot password functionality will be implemented here');
}

function requestAccount() {
  // 实现请求账号逻辑
  alert('Request account functionality will be implemented here');
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #212C4F;
  font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
}

.form-container {
  width: 100%;
  max-width: 400px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
}

.logo-design {
  color: white;
  font-weight: bold;
  font-size: 24px;
  text-shadow: 0px 10px 20px rgba(0, 0, 0, 0.25);
}

.logo-code {
  background: linear-gradient(to right, #4899F7, #2457F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
  font-size: 24px;
}

.logo-progress {
  background: linear-gradient(to right, #9DE1E5, #B8DFB2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
  font-size: 24px;
}

.hq {
  color: #3672F8;
  font-weight: 600;
  font-size: 24px;
  margin-left: 8px;
}

.title {
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
}

form {
  width: 100%;
}

.input-group {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 15px;
  border-radius: 4px;
  font-size: 20px;
}

.input-field:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.forgot-password {
  text-align: center;
  margin-bottom: 20px;
}

.forgot-password a {
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  font-size: 16px;
}

.sign-in-button {
  width: 100%;
  background-color: #56CCF2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 15px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s, opacity 0.3s;
}

.sign-in-button:hover {
  background-color: #4bbce0;
}

.sign-in-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.register-container {
  margin-top: 30px;
  text-align: center;
}

.register-text {
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
  margin-bottom: 5px;
}

.request-account {
  color: white;
  text-decoration: none;
  font-size: 16px;
}
</style>