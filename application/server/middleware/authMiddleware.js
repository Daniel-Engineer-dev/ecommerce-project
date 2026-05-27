const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "Không có token, quyền truy cập bị từ chối" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey_tmdt');
        if (decoded.type === 'refresh') {
            return res.status(401).json({ message: "Token khÃ´ng há»£p lá»‡" });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

module.exports = auth;
