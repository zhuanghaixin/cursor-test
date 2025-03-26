<template>
    <div class="user-management-container">
        <!-- 顶部导航栏 -->
        <header class="dashboard-header">
            <div class="logo">
                <span class="logo-design">Design</span>
                <span class="logo-code">Code</span>
                <span class="logo-progress">Progress</span>
                <span class="hq">HQ</span>
            </div>
            <div class="user-menu">
                <span>{{ currentUser?.name }}</span>
                <button @click="logout" class="logout-button">退出</button>
            </div>
        </header>

        <div class="content">
            <div class="page-header">
                <h1>用户管理</h1>
                <button v-if="isAdmin" @click="showCreateModal" class="create-button">
                    创建用户
                </button>
            </div>

            <!-- 用户列表 -->
            <div class="users-table" v-if="!loading">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>姓名</th>
                            <th>邮箱</th>
                            <th>角色</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.role === 'admin' ? '管理员' : '普通用户' }}</td>
                            <td class="actions">
                                <button @click="editUser(user)" class="edit-button">
                                    编辑
                                </button>
                                <button v-if="isAdmin && user.id !== currentUser?.id" @click="confirmDelete(user)"
                                    class="delete-button">
                                    删除
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="loading">
                加载中...
            </div>
        </div>

        <!-- 创建/编辑用户模态框 -->
        <div class="modal" v-if="showModal">
            <div class="modal-content">
                <h2>{{ editingUser ? '编辑用户' : '创建用户' }}</h2>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label>姓名</label>
                        <input v-model="userForm.name" type="text" required placeholder="请输入姓名" />
                    </div>
                    <div class="form-group">
                        <label>邮箱</label>
                        <input v-model="userForm.email" type="email" required placeholder="请输入邮箱" />
                    </div>
                    <div class="form-group" v-if="!editingUser">
                        <label>密码</label>
                        <input v-model="userForm.password" type="password" required placeholder="请输入密码" />
                    </div>
                    <div class="form-group" v-if="isAdmin">
                        <label>角色</label>
                        <select v-model="userForm.role">
                            <option value="user">普通用户</option>
                            <option value="admin">管理员</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="submit-button">
                            {{ editingUser ? '保存' : '创建' }}
                        </button>
                        <button type="button" @click="closeModal" class="cancel-button">
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 删除确认模态框 -->
        <div class="modal" v-if="showDeleteModal">
            <div class="modal-content">
                <h2>确认删除</h2>
                <p>确定要删除用户 "{{ userToDelete?.name }}" 吗？此操作不可撤销。</p>
                <div class="modal-actions">
                    <button @click="handleDelete" class="delete-button">
                        确认删除
                    </button>
                    <button @click="showDeleteModal = false" class="cancel-button">
                        取消
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

const router = useRouter();
const authStore = useAuthStore();

const users = ref<User[]>([]);
const loading = ref(true);
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);
const currentUser = computed(() => authStore.user);
const isAdmin = computed(() => currentUser.value?.role === 'admin');

const userForm = ref({
    name: '',
    email: '',
    password: '',
    role: 'user'
});

// 获取用户列表
async function fetchUsers() {
    try {
        const response = await axios.get('/api/users');
        users.value = response.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
    } finally {
        loading.value = false;
    }
}

// 显示创建用户模态框
function showCreateModal() {
    editingUser.value = null;
    userForm.value = {
        name: '',
        email: '',
        password: '',
        role: 'user'
    };
    showModal.value = true;
}

// 显示编辑用户模态框
function editUser(user: User) {
    editingUser.value = user;
    userForm.value = {
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
    };
    showModal.value = true;
}

// 确认删除用户
function confirmDelete(user: User) {
    userToDelete.value = user;
    showDeleteModal.value = true;
}

// 提交表单
async function handleSubmit() {
    try {
        if (editingUser.value) {
            // 更新用户
            await axios.put(`/api/users/${editingUser.value.id}`, userForm.value);
        } else {
            // 创建用户
            await axios.post('/api/users', userForm.value);
        }
        await fetchUsers();
        closeModal();
    } catch (error: any) {
        alert(error.response?.data?.message || '操作失败');
    }
}

// 删除用户
async function handleDelete() {
    if (!userToDelete.value) return;

    try {
        await axios.delete(`/api/users/${userToDelete.value.id}`);
        users.value = users.value.filter(u => u.id !== userToDelete.value?.id);
        showDeleteModal.value = false;
    } catch (error: any) {
        alert(error.response?.data?.message || '删除失败');
    }
}

// 关闭模态框
function closeModal() {
    showModal.value = false;
    editingUser.value = null;
    userForm.value = {
        name: '',
        email: '',
        password: '',
        role: 'user'
    };
}

// 退出登录
function logout() {
    authStore.logout();
    router.push('/login');
}

onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>
.user-management-container {
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

.content {
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.page-header h1 {
    font-size: 24px;
    color: #212529;
    margin: 0;
}

.create-button {
    background-color: #56CCF2;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
}

.users-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
}

th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
}

.actions {
    display: flex;
    gap: 8px;
}

.edit-button,
.delete-button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
}

.edit-button {
    background-color: #e9ecef;
    color: #495057;
}

.delete-button {
    background-color: #ff6b6b;
    color: white;
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
    max-width: 500px;
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

.form-group input,
.form-group select {
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

.loading {
    text-align: center;
    padding: 40px;
    color: #666;
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
}
</style>