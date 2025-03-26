<template>
    <div class="user-management-container">
        <header class="dashboard-header">
            <div class="logo">
                <span class="logo-design">Design</span><span class="logo-code">Code</span> <span class="hq">HQ</span>
            </div>
            <div class="user-menu">
                <span v-if="authStore.user">{{ authStore.user.name }}</span>
                <button @click="logout" class="logout-button">退出登录</button>
            </div>
        </header>

        <main class="content">
            <div class="content-header">
                <h1>用户管理</h1>
                <button @click="showCreateUserModal = true" class="create-button">
                    创建用户
                </button>
            </div>

            <!-- 用户列表 -->
            <div class="users-list" v-if="!isLoading">
                <div class="user-card" v-for="user in users" :key="user.id">
                    <div class="user-info">
                        <h3>{{ user.name }}</h3>
                        <p>{{ user.email }}</p>
                        <p class="user-role">角色: {{ user.role || '普通用户' }}</p>
                    </div>
                    <div class="user-actions">
                        <button @click="editUser(user)" class="edit-button">编辑</button>
                        <button @click="confirmDelete(user)" class="delete-button">删除</button>
                    </div>
                </div>
            </div>

            <div v-else class="loading">
                加载中...
            </div>

            <!-- 创建/编辑用户模态框 -->
            <div class="modal" v-if="showCreateUserModal || showEditUserModal">
                <div class="modal-content">
                    <h2>{{ editingUser ? '编辑用户' : '创建用户' }}</h2>
                    <form @submit.prevent="handleSubmitUser">
                        <div class="form-group">
                            <label>姓名</label>
                            <input type="text" v-model="userForm.name" required />
                        </div>
                        <div class="form-group">
                            <label>邮箱</label>
                            <input type="email" v-model="userForm.email" required />
                        </div>
                        <div class="form-group">
                            <label>角色</label>
                            <select v-model="userForm.role">
                                <option value="user">普通用户</option>
                                <option value="admin">管理员</option>
                            </select>
                        </div>
                        <div class="form-group" v-if="!editingUser">
                            <label>密码</label>
                            <input type="password" v-model="userForm.password" required />
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
                        <button @click="handleDeleteUser" class="delete-button">
                            确认删除
                        </button>
                        <button @click="showDeleteModal = false" class="cancel-button">
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

interface UserForm {
    name: string;
    email: string;
    password?: string;
    role: string;
}

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const users = ref<User[]>([]);
const isLoading = ref(true);
const showCreateUserModal = ref(false);
const showEditUserModal = ref(false);
const showDeleteModal = ref(false);
const editingUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);

const userForm = ref<UserForm>({
    name: '',
    email: '',
    password: '',
    role: 'user'
});

onMounted(async () => {
    try {
        users.value = await userStore.fetchUsers();
    } catch (error) {
        console.error('Failed to fetch users:', error);
    } finally {
        isLoading.value = false;
    }
});

function logout() {
    authStore.logout();
    router.push('/login');
}

function editUser(user: User) {
    editingUser.value = user;
    userForm.value = {
        name: user.name,
        email: user.email,
        role: user.role || 'user'
    };
    showEditUserModal.value = true;
}

function confirmDelete(user: User) {
    userToDelete.value = user;
    showDeleteModal.value = true;
}

async function handleSubmitUser() {
    try {
        if (editingUser.value) {
            await userStore.updateUser({
                id: editingUser.value.id,
                ...userForm.value
            });
        } else {
            await userStore.createUser(userForm.value);
        }
        closeModal();
        users.value = await userStore.fetchUsers();
    } catch (error) {
        console.error('Failed to save user:', error);
    }
}

async function handleDeleteUser() {
    if (!userToDelete.value) return;

    try {
        await userStore.deleteUser(userToDelete.value.id);
        users.value = users.value.filter(u => u.id !== userToDelete.value?.id);
        showDeleteModal.value = false;
    } catch (error) {
        console.error('Failed to delete user:', error);
    }
}

function closeModal() {
    showCreateUserModal.value = false;
    showEditUserModal.value = false;
    editingUser.value = null;
    userForm.value = {
        name: '',
        email: '',
        password: '',
        role: 'user'
    };
}
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

.hq {
    color: #3672F8;
    margin-left: 8px;
}

.content {
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
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

.users-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.user-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
}

.user-info h3 {
    margin: 0 0 10px;
    color: #212C4F;
}

.user-info p {
    margin: 5px 0;
    color: #666;
}

.user-role {
    font-size: 0.9em;
    color: #888;
}

.user-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.edit-button,
.delete-button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
}

.edit-button {
    background-color: #56CCF2;
    color: white;
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
    color: #212C4F;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #666;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
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