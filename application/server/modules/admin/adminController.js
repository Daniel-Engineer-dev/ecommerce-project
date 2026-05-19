const adminService = require('./adminService');

// ─── PARTNER APPROVAL (đã có) ─────────────────────────────────────────────────

const getPendingPartners = async (req, res) => {
    try {
        const partners = await adminService.getPendingPartners();
        res.json(partners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const approvePartner = async (req, res) => {
    try {
        const result = await adminService.approvePartner(req.params.id);
        res.json({ message: 'Phê duyệt thành công', ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const rejectPartner = async (req, res) => {
    try {
        const result = await adminService.rejectPartner(req.params.id);
        res.json({ message: 'Đã từ chối đối tác', ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── BR-ADM-01: USER MANAGEMENT ──────────────────────────────────────────────

const getAllUsers = async (req, res) => {
    try {
        const { role, search, status, page, limit } = req.query;
        const result = await adminService.getAllUsers({ role, search, status, page, limit });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await adminService.getUserById(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

const toggleUserLock = async (req, res) => {
    try {
        const { lock } = req.body; 
        const result = await adminService.toggleUserLock(req.params.id, lock);
        res.json({ message: lock ? 'Đã khóa người dùng' : 'Đã mở khóa người dùng', ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const result = await adminService.changeUserRole(req.params.id, role);
        res.json({ message: 'Đã cập nhật quyền người dùng', ...result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getUserStats = async (req, res) => {
    try {
        const stats = await adminService.getUserStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    // Partner approval
    getPendingPartners,
    approvePartner,
    rejectPartner,
    getAllUsers,
    getUserById,
    toggleUserLock,
    changeUserRole,
    getUserStats,
};