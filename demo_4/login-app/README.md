# Design+Code HQ 登录系统

这个项目是基于 Figma 设计稿实现的 Vue 3 + TypeScript 登录页面，包含前端和后端实现。

## 功能特点

- 完全响应式设计
- 使用 Vue 3 组合式 API
- TypeScript 类型支持
- Pinia 状态管理
- JWT 身份验证
- Express 后端 API

## 项目设置

### 安装依赖

```bash
npm install
```

### 启动开发服务器

前端开发服务器：

```bash
npm run dev
```

后端服务器：

```bash
npm run server
```

### 构建生产版本

```bash
npm run build
```

## 使用指南

1. 启动前端和后端服务器
2. 访问 `http://localhost:5173`
3. 使用以下凭据登录：
   - 邮箱：designer@website.com
   - 密码：password123

## 项目结构

- `src/views/LoginView.vue` - 登录页面组件
- `src/views/DashboardView.vue` - 仪表盘页面组件
- `src/stores/auth.ts` - 认证状态管理
- `src/router/index.ts` - 路由配置
- `server.js` - Express 后端服务器

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Axios
- Express
- JWT

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
