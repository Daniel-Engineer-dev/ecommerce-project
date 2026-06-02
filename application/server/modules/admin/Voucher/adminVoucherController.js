const adminVoucherService = require('./adminVoucherService');

const getAdminVouchers = async (req, res) => {
    try {
        const { status, search, page, limit } = req.query;
        
        const result = await adminVoucherService.getAdminVouchers({
            status,
            search,
            page: parseInt(page, 10) || 1,   
            limit: parseInt(limit, 10) || 10
        });
        
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const approveVoucher = async (req, res) => {
    try {
        const result = await adminVoucherService.approveVoucher(req.params.id, req.user.id);
        res.json({ message: "Phê duyệt voucher thành công", voucher: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const rejectVoucher = async (req, res) => {
    try {
        const { reason } = req.body;
        const result = await adminVoucherService.rejectVoucher(req.params.id, req.user.id, reason);
        res.json({ message: "Đã từ chối cấp phép voucher này", voucher: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const toggleVisibility = async (req, res) => {
    try {
        const { currentStatus } = req.body;
        const result = await adminVoucherService.toggleVisibility(req.params.id, currentStatus, req.user.id);
        res.json({ message: "Đã thay đổi trạng thái vận hành của voucher", voucher: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getPartnerVoucherCount = async (req, res) => {
    try {
        const count = await adminVoucherService.getPartnerVoucherCount(req.params.partnerId);
        return res.status(200).json({ count });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminVouchers, approveVoucher, rejectVoucher, toggleVisibility, getPartnerVoucherCount };
