const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const {
    getPendingPartners, 
    approvePartner, 
    rejectPartner,
    getAllUsers, 
    getUserById, 
    toggleUserLock, 
    changeUserRole, 
    getUserStats,
} = require('./adminController');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Quyền truy cập bị từ chối. Yêu cầu quyền Quản trị viên.' });
    }
};

// ─── PARTNER APPROVAL ────────────────────────────────────────────────────────
router.get ('/partners/pending',        auth, adminOnly, getPendingPartners);
router.post('/partners/approve/:id',    auth, adminOnly, approvePartner);
router.post('/partners/reject/:id',     auth, adminOnly, rejectPartner);

// ─── USER MANAGEMENT ──────────────────────────────────────────────
router.get ('/users/stats',             auth, adminOnly, getUserStats);
router.get ('/users',                   auth, adminOnly, getAllUsers);
router.get ('/users/:id',               auth, adminOnly, getUserById);
router.patch('/users/:id/toggle-lock',  auth, adminOnly, toggleUserLock);
router.patch('/users/:id/role',         auth, adminOnly, changeUserRole);

module.exports = router;