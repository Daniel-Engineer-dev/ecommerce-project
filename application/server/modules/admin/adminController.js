const adminService = require('./adminService');

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
        const result = await adminService.approvePartner(req.params.id, req.user?.id);
        res.json({ message: 'Partner approved successfully', ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const rejectPartner = async (req, res) => {
    try {
        const result = await adminService.rejectPartner(req.params.id, req.user?.id);
        res.json({ message: 'Partner rejected successfully', ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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
        const result = await adminService.toggleUserLock(req.params.id, lock, req.user?.id);
        res.json({ message: lock ? 'User locked successfully' : 'User unlocked successfully', ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const result = await adminService.changeUserRole(req.params.id, role, req.user?.id);
        res.json({ message: 'User role updated successfully', ...result });
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

const getOrders = async (req, res) => {
    try {
        const result = await adminService.getOrders(req.query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const order = await adminService.getOrderDetail(req.params.id);
        res.json(order);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await adminService.updateOrderStatus(req.params.id, req.body.status, req.user?.id, req.body.note);
        res.json({ message: 'Order status updated successfully', order });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getComplaints = async (req, res) => {
    try {
        const result = await adminService.getComplaints(req.query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { status, actionType, responseContent } = req.body;
        const complaint = await adminService.updateComplaintStatus(
            req.params.id, 
            { status, actionType, responseContent }, 
            req.user?.id
        );
        res.json({ message: 'Cập nhật khiếu nại thành công', complaint });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getSystemLogs = async (req, res) => {
    try {
        const result = await adminService.getSystemLogs(req.query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getContentItems = async (req, res) => {
    try {
        const items = await adminService.getContentItems(req.query);
        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const upsertContentItem = async (req, res) => {
    try {
        const item = await adminService.upsertContentItem(req.body, req.user?.id);
        res.json({ message: 'Content saved successfully', item });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getVoucherAndComplaintStats = async (req, res) => {
    try {
        const stats = await adminService.getVoucherAndComplaintStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getDashboardChartData = async (req, res) => {
    try {
        const validUnits = ['month', 'quarter', 'year'];
        const rawUnit = (req.query.unit ?? '').trim().toLowerCase();
        const unit = validUnits.includes(rawUnit) ? rawUnit : 'month';
        const chartData = await adminService.getDashboardChartData(unit);
        res.json({ unit, chartData });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getPendingPartners,
    approvePartner,
    rejectPartner,
    getAllUsers,
    getUserById,
    toggleUserLock,
    changeUserRole,
    getUserStats,
    getOrders,
    getOrderDetail,
    updateOrderStatus,
    getComplaints,
    updateComplaintStatus,
    getSystemLogs,
    getContentItems,
    upsertContentItem,
    getVoucherAndComplaintStats,
    getDashboardChartData,
};