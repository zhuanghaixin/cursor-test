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