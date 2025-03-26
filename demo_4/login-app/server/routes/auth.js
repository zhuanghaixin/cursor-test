const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// 模拟数据库
let users = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqDOMk9jqveWi', // 密码: admin123
        role: 'admin'
    }
];

// 登录
router.post('/login', [
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').notEmpty().withMessage('密码不能为空'),
], async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // 查找用户
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: '用户不存在' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // 返回用户信息和 token（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 注册
router.post('/register', [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
], async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

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
            role: 'user'
        };

        users.push(newUser);

        // 生成 JWT
        const token = jwt.sign(
            { userId: newUser.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // 返回用户信息和 token（不包含密码）
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 请求密码重置
router.post('/forgot-password', [
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
], async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        // 检查用户是否存在
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: '该邮箱未注册' });
        }

        // 生成重置令牌
        const resetToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // TODO: 发送重置密码邮件
        // 在实际应用中，这里应该发送一封包含重置链接的邮件
        // 为了演示，我们直接返回重置令牌
        res.json({
            message: '密码重置链接已发送到您的邮箱',
            resetToken // 在实际应用中不应该返回这个
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 重置密码
router.post('/reset-password', [
    body('token').notEmpty().withMessage('令牌不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
], async (req, res) => {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    try {
        // 验证令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(400).json({ message: '无效的重置令牌' });
        }

        // 更新密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;

        res.json({ message: '密码已成功重置' });
    } catch (error) {
        console.error('Password reset error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: '无效的重置令牌' });
        }
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取当前用户信息
router.get('/me', auth, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

module.exports = router; 