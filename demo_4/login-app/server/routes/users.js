const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// 模拟数据库
// 注意：在实际应用中，这应该是一个真实的数据库
// 这里我们使用 auth.js 中的相同用户数组
const users = require('./auth').users;

// 中间件：检查是否是管理员
const isAdmin = (req, res, next) => {
    const user = users.find(u => u.id === req.user.userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};

// 获取所有用户（需要管理员权限）
router.get('/', [auth, isAdmin], (req, res) => {
    // 返回用户列表（不包含密码）
    const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
});

// 创建新用户（需要管理员权限）
router.post('/', [
    auth,
    isAdmin,
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
    body('role').isIn(['user', 'admin']).withMessage('角色必须是 user 或 admin'),
], async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
        // 检查邮箱是否已存在
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }

        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 创建新用户
        const newUser = {
            id: String(users.length + 1),
            name,
            email,
            password: hashedPassword,
            role
        };

        users.push(newUser);

        // 返回新用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新用户（需要管理员权限）
router.put('/:id', [
    auth,
    isAdmin,
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').optional().isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
    body('role').optional().isIn(['user', 'admin']).withMessage('角色必须是 user 或 admin'),
], async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, password, role } = req.body;

    try {
        // 查找用户
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 检查邮箱是否已被其他用户使用
        if (email && email !== users[userIndex].email) {
            if (users.some(u => u.email === email)) {
                return res.status(400).json({ message: '该邮箱已被注册' });
            }
        }

        // 更新用户信息
        const updatedUser = { ...users[userIndex] };
        if (name) updatedUser.name = name;
        if (email) updatedUser.email = email;
        if (role) updatedUser.role = role;

        // 如果提供了新密码，更新密码
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedUser.password = await bcrypt.hash(password, salt);
        }

        users[userIndex] = updatedUser;

        // 返回更新后的用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除用户（需要管理员权限）
router.delete('/:id', [auth, isAdmin], (req, res) => {
    const { id } = req.params;

    // 查找用户
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: '用户不存在' });
    }

    // 不允许删除自己
    if (id === req.user.userId) {
        return res.status(400).json({ message: '不能删除当前登录的用户' });
    }

    // 删除用户
    users.splice(userIndex, 1);
    res.json({ message: '用户已成功删除' });
});

module.exports = router; 