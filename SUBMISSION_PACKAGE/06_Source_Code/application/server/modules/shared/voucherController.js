const voucherService = require('./voucherService');

const getVouchers = async (req, res) => {
    try {
        const vouchers = await voucherService.getVouchers();
        res.json(vouchers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await voucherService.getCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPartnersList = async (req, res) => {
    try {
        const partners = await voucherService.getPartnersList();
        res.json(partners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getVoucherById = async (req, res) => {
    try {
        const voucher = await voucherService.getVoucherById(req.params.id);
        if (!voucher) return res.status(404).json({ message: "Voucher không tồn tại" });
        res.json(voucher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const searchVouchers = async (req, res) => {
    try {
        const vouchers = await voucherService.searchVouchers(req.query);
        res.json(vouchers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getVouchers, getVoucherById, searchVouchers, getCategories, getPartnersList };
