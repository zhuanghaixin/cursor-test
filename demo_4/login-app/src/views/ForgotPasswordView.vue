<template>
    <div class="forgot-password-container">
        <div class="form-container">
            <!-- Logo部分 -->
            <div class="logo">
                <div class="logo-design">Design</div>
                <div class="logo-code">Code</div>
                <div class="logo-progress">Progress</div>
                <div class="hq">HQ</div>
            </div>

            <!-- 标题 -->
            <h1 class="title">重置密码</h1>

            <!-- 表单 -->
            <form @submit.prevent="handleResetPassword" class="reset-form">
                <div class="description">
                    请输入您的注册邮箱，我们将向您发送重置密码的链接。
                </div>

                <div class="input-group">
                    <input type="email" v-model="email" placeholder="邮箱" required class="input-field" />
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div v-if="success" class="success-message">
                    {{ success }}
                </div>

                <button type="submit" class="submit-button" :disabled="isLoading">
                    <span v-if="!isLoading">发送重置链接</span>
                    <span v-else>发送中...</span>
                </button>
            </form>

            <!-- 返回登录 -->
            <div class="back-to-login">
                <router-link to="/login" class="link">返回登录</router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const email = ref('');
const isLoading = ref(false);
const error = ref('');
const success = ref('');

async function handleResetPassword() {
    isLoading.value = true;
    error.value = '';
    success.value = '';

    try {
        await authStore.requestPasswordReset(email.value);
        success.value = '重置密码链接已发送到您的邮箱，请查收';
        email.value = ''; // 清空输入
    } catch (err: any) {
        error.value = err.message || '发送重置链接失败';
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped>
.forgot-password-container {
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
    margin-bottom: 20px;
    text-align: center;
}

.description {
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.5;
}

.reset-form {
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

.error-message {
    color: #ff6b6b;
    margin-bottom: 20px;
    text-align: center;
}

.success-message {
    color: #51cf66;
    margin-bottom: 20px;
    text-align: center;
}

.submit-button {
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

.submit-button:hover {
    background-color: #4bbce0;
}

.submit-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.back-to-login {
    margin-top: 30px;
    text-align: center;
}

.link {
    color: white;
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
}
</style>