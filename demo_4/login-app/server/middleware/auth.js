const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 从请求头获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }

    try {
        // 验证 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: '无效的认证令牌' });
    }
}; 