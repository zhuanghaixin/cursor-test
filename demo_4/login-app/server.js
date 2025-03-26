import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key'; // 在生产环境中应该使用环境变量保存密钥

// CORS 配置
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 调试中间件
app.use((req, res, next) => {
    console.log('收到请求:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    next();
});

// 模拟用户数据库
const users = [
    {
        id: '1',
        email: 'admin@example.com',
        password: 'admin123',
        name: '管理员用户',
        role: 'admin'
    },
    {
        id: '2',
        email: 'designer@website.com',
        password: 'password123',
        name: '设计师用户',
        role: 'user'
    },
    {
        id: '3',
        email: 'test@test.com',
        password: 'test123',
        name: '测试用户',
        role: 'user'
    }
];

// 登录路由
app.post('/api/auth/login', (req, res) => {
    console.log('收到登录请求，请求体:', req.body);

    if (!req.body || !req.body.email || !req.body.password) {
        console.log('请求格式错误:', req.body);
        return res.status(400).json({
            message: '请求格式错误',
            received: req.body
        });
    }

    const { email, password } = req.body;
    console.log('尝试登录:', { email, password });

    // 查找用户
    const user = users.find(u => u.email === email);
    console.log('查找用户结果:', {
        email,
        userFound: !!user,
        userDetails: user ? { ...user, password: '***' } : null
    });

    // 验证用户和密码
    if (!user || user.password !== password) {
        console.log('验证失败:', {
            userExists: !!user,
            passwordMatch: user ? user.password === password : false,
            attemptedPassword: password,
            correctPassword: user ? user.password : null
        });
        return res.status(401).json({ message: '邮箱或密码不正确' });
    }

    // 创建 token
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    // 返回用户数据和 token（排除密码）
    const { password: _, ...userWithoutPassword } = user;

    console.log('登录成功:', {
        user: userWithoutPassword,
        token: token.substring(0, 20) + '...'
    });

    res.json({
        user: userWithoutPassword,
        token
    });
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);

    if (!user) {
        return res.status(404).json({ message: '用户未找到' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// 中间件：验证 token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '令牌无效或已过期' });
        }

        req.user = user;
        next();
    });
}

// 用户管理路由
// 获取所有用户（仅管理员）
app.get('/api/users', authenticateToken, (req, res) => {
    // 检查是否是管理员
    const user = users.find(u => u.id === req.user.userId);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' });
    }

    // 返回用户列表（不包含密码）
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
});

// 创建新用户（仅管理员）
app.post('/api/users', authenticateToken, (req, res) => {
    // 检查是否是管理员
    const admin = users.find(u => u.id === req.user.userId);
    if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' });
    }

    const { name, email, password, role = 'user' } = req.body;

    // 验证必填字段
    if (!name || !email || !password) {
        return res.status(400).json({ message: '姓名、邮箱和密码为必填项' });
    }

    // 检查邮箱是否已存在
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 创建新用户
    const newUser = {
        id: String(users.length + 1),
        name,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'user'
    };

    users.push(newUser);

    // 返回新用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

// 更新用户信息（管理员可以更新所有用户，普通用户只能更新自己）
app.put('/api/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const currentUser = users.find(u => u.id === req.user.userId);

    // 检查权限
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== id)) {
        return res.status(403).json({ message: '没有权限修改此用户信息' });
    }

    // 查找要更新的用户
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: '用户不存在' });
    }

    const { name, email, password, role } = req.body;
    const updatedUser = { ...users[userIndex] };

    // 更新字段
    if (name) updatedUser.name = name;
    if (email && email !== users[userIndex].email) {
        // 检查新邮箱是否已被使用
        if (users.some(u => u.email === email && u.id !== id)) {
            return res.status(400).json({ message: '该邮箱已被其他用户使用' });
        }
        updatedUser.email = email;
    }
    if (password) updatedUser.password = password;
    if (role && currentUser.role === 'admin') {
        updatedUser.role = role === 'admin' ? 'admin' : 'user';
    }

    users[userIndex] = updatedUser;

    // 返回更新后的用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
});

// 删除用户（仅管理员）
app.delete('/api/users/:id', authenticateToken, (req, res) => {
    // 检查是否是管理员
    const admin = users.find(u => u.id === req.user.userId);
    if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' });
    }

    const { id } = req.params;

    // 防止删除自己
    if (id === admin.id) {
        return res.status(400).json({ message: '不能删除当前登录的管理员账号' });
    }

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: '用户不存在' });
    }

    // 删除用户
    users.splice(userIndex, 1);
    res.status(204).send();
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`后端服务器运行在 http://localhost:${PORT}`);
    console.log('可用的测试账号:');
    users.forEach(user => {
        console.log(`- ${user.name}:`);
        console.log(`  邮箱: ${user.email}`);
        console.log(`  密码: ${user.password}`);
        console.log(`  角色: ${user.role}`);
        console.log('---');
    });
}); 