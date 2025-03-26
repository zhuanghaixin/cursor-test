<template>
    <div class="register-container">
        <div class="form-container">
            <!-- Logo部分 -->
            <div class="logo">
                <div class="logo-design">Design</div>
                <div class="logo-code">Code</div>
                <div class="logo-progress">Progress</div>
                <div class="hq">HQ</div>
            </div>

            <!-- 标题 -->
            <h1 class="title">注册 Design+Code HQ 账号</h1>

            <!-- 表单 -->
            <form @submit.prevent="handleRegister" class="register-form">
                <div class="input-group">
                    <input type="text" v-model="name" placeholder="姓名" required class="input-field" />
                </div>

                <div class="input-group">
                    <input type="email" v-model="email" placeholder="邮箱" required class="input-field" />
                </div>

                <div class="input-group">
                    <input type="password" v-model="password" placeholder="密码" required class="input-field" />
                </div>

                <div class="input-group">
                    <input type="password" v-model="confirmPassword" placeholder="确认密码" required class="input-field" />
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <button type="submit" class="submit-button" :disabled="isLoading">
                    <span v-if="!isLoading">注册</span>
                    <span v-else>注册中...</span>
                </button>
            </form>

            <!-- 登录链接 -->
            <div class="login-link">
                <p>已有账号？</p>
                <router-link to="/login" class="link">登录</router-link>
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

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const error = ref('');

async function handleRegister() {
    if (password.value !== confirmPassword.value) {
        error.value = '两次输入的密码不一致';
        return;
    }

    isLoading.value = true;
    error.value = '';

    try {
        await authStore.register({
            name: name.value,
            email: email.value,
            password: password.value
        });
        router.push('/dashboard');
    } catch (err: any) {
        error.value = err.message || '注册失败';
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped>
.register-container {
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

.register-form {
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

.login-link {
    margin-top: 30px;
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
}

.link {
    color: white;
    text-decoration: none;
    margin-left: 5px;
}

.link:hover {
    text-decoration: underline;
}
</style>