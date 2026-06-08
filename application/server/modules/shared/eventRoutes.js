const express = require('express');
const jwt = require('jsonwebtoken');
const eventBus = require('../../utils/eventBus');

const router = express.Router();

router.get('/', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).json({ message: 'Khong co token, quyen truy cap bi tu choi' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey_tmdt');
        if (decoded.type === 'refresh' || !['Admin', 'Partner'].includes(decoded.role)) {
            return res.status(403).json({ message: 'Token khong hop le cho realtime events' });
        }

        eventBus.addClient({ user: decoded, res });
    } catch (err) {
        return res.status(401).json({ message: 'Token khong hop le' });
    }
});

module.exports = router;
