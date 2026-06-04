// modules/admin/adminOrder/adminOrderController.js
const adminOrderService = require('./adminOrderService');

const getAllOrders = async (req, res) => {
    try {
        const { status, search, page, limit } = req.query;
        const result = await adminOrderService.getAllOrders({
            status,
            search,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const result = await adminOrderService.getOrderById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const confirmPayment = async (req, res) => {
    try {
        // req.user.id lấy từ Middleware giải mã JWT Auth thành công
        const result = await adminOrderService.confirmPayment(req.params.id, req.user.id);
        res.status(200).json({ message: "Đã phê duyệt trạng thái thanh toán thủ công", order: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const refundOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const result = await adminOrderService.refundAndCancelOrder(req.params.id, req.user.id, reason);
        res.status(200).json({ message: "Hủy đơn hàng và hoàn trả ví mô phỏng thành công", result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getAllOrders,
    getOrderDetails,
    confirmPayment,
    refundOrder
};