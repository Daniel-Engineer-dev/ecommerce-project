const express = require('express');
const router = express.Router();
const { getPendingPartners, approvePartner, rejectPartner } = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

// Middleware kiểm tra quyền Admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: "Quyền truy cập bị từ chối. Yêu cầu quyền Quản trị viên." });
    }
};

router.get('/partners/pending', auth, adminOnly, getPendingPartners);
router.post('/partners/approve/:id', auth, adminOnly, approvePartner);
router.post('/partners/reject/:id', auth, adminOnly, rejectPartner);

module.exports = router;
