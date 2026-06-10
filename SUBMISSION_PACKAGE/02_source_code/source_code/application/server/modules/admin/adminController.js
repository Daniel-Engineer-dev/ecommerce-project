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
        const result = await adminService.toggleUserLock(req.params.id, req.body?.lock, req.user?.id);
        res.json({
            message: result.is_active ? 'User unlocked successfully' : 'User locked successfully',
            ...result,
        });
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
        if (status === 'Resolved' && actionType === 'NewCode') {
            const result = await adminService.issueComplaintVoucher(
                req.params.id,
                { note: responseContent },
                req.user?.id
            );
            return res.json({ message: 'Đã cấp voucher bồi thường thành công', ...result });
        }
        if (status === 'Resolved' && actionType === 'Refund') {
            const complaint = await adminService.markComplaintRefundPending(
                req.params.id,
                { note: responseContent },
                req.user?.id
            );
            return res.json({ message: 'Đã ghi nhận yêu cầu hoàn tiền thủ công', complaint });
        }
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

const issueComplaintVoucher = async (req, res) => {
    try {
        const result = await adminService.issueComplaintVoucher(req.params.id, req.body || {}, req.user?.id);
        res.json({ message: 'Đã cấp voucher bồi thường thành công', ...result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const markComplaintRefundPending = async (req, res) => {
    try {
        const complaint = await adminService.markComplaintRefundPending(req.params.id, req.body || {}, req.user?.id);
        res.json({ message: 'Đã ghi nhận yêu cầu hoàn tiền thủ công', complaint });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const markComplaintRefunded = async (req, res) => {
    try {
        const complaint = await adminService.markComplaintRefunded(req.params.id, req.body || {}, req.user?.id);
        res.json({ message: 'Đã ghi nhận hoàn tiền thủ công', complaint });
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

const getContentTemplates = async (req, res) => {
    try {
        const templates = adminService.getContentTemplates();
        res.json({ templates });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getContentItemByKey = async (req, res) => {
    try {
        const item = await adminService.getContentItemByKey(req.params.contentKey);
        res.json({ item });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
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

const getContentByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const result = await adminService.getContentByKey(key);
        res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
};

const updateContentItemByKey = async (req, res) => {
    try {
        const item = await adminService.updateContentItemByKey(
            req.params.contentKey,
            req.body || {},
            req.user?.id
        );
        res.json({ message: 'Content updated successfully', item });
    } catch (err) {
        res.status(err.statusCode || 400).json({ error: err.message });
    }
};

const publishContentItem = async (req, res) => {
    try {
        const item = await adminService.publishContentItem(req.params.contentKey, req.user?.id);
        res.json({ message: 'Content published successfully', item });
    } catch (err) {
        res.status(err.statusCode || 400).json({ error: err.message });
    }
};

const archiveContentItem = async (req, res) => {
    try {
        const item = await adminService.archiveContentItem(req.params.contentKey, req.user?.id);
        res.json({ message: 'Content archived successfully', item });
    } catch (err) {
        res.status(err.statusCode || 400).json({ error: err.message });
    }
};

const resetContentItem = async (req, res) => {
    try {
        const item = await adminService.resetContentItem(req.params.contentKey, req.user?.id);
        res.json({ message: 'Content reset successfully', item });
    } catch (err) {
        res.status(err.statusCode || 400).json({ error: err.message });
    }
};

const getContentRevisions = async (req, res) => {
    try {
        const revisions = await adminService.getContentRevisions(req.params.contentKey);
        res.json({ revisions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPublicContentItems = async (req, res) => {
    try {
        const items = await adminService.getPublicContentItems(req.query);
        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPublicContentBySlug = async (req, res) => {
    try {
        const item = await adminService.getPublicContentBySlug(req.params.slug);
        res.json({ item });
    } catch (err) {
        if (err.hidden) {
            return res.status(err.statusCode || 423).json({
                hidden: true,
                message: err.message,
                item: err.item,
            });
        }
        res.status(err.statusCode || 500).json({ error: err.message });
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
    issueComplaintVoucher,
    markComplaintRefundPending,
    markComplaintRefunded,
    getSystemLogs,
    getContentItems,
    getContentTemplates,
    getContentItemByKey,
    upsertContentItem,
    updateContentItemByKey,
    publishContentItem,
    archiveContentItem,
    resetContentItem,
    getContentRevisions,
    getVoucherAndComplaintStats,
    getDashboardChartData,
    getContentByKey,
    getPublicContentItems,
    getPublicContentBySlug
};
