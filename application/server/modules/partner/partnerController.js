const partnerService = require('./partnerService');

const getBranches = async (req, res) => {
    try {
        res.json(await partnerService.getBranches(req.user.id));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDashboard = async (req, res) => {
    try {
        res.json(await partnerService.getDashboard(req.user.id));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getReport = async (req, res) => {
    try {
        res.json(await partnerService.getReport(req.user.id));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getVouchers = async (req, res) => {
    try {
        res.json(await partnerService.getVouchers(req.user.id));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getVoucherById = async (req, res) => {
    try {
        res.json(await partnerService.getVoucherById(req.user.id, req.params.id));
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const createVoucher = async (req, res) => {
    try {
        const voucher = await partnerService.createVoucher(req.user.id, req.body);
        res.status(201).json({ message: 'Tao voucher thanh cong va da gui vao hang cho duyet', voucher });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateVoucher = async (req, res) => {
    try {
        const voucher = await partnerService.updateVoucher(req.user.id, req.params.id, req.body);
        res.json({ message: 'Cap nhat voucher thanh cong', voucher });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const submitVoucher = async (req, res) => {
    try {
        const voucher = await partnerService.submitVoucher(req.user.id, req.params.id);
        res.json({ message: 'Da gui voucher sang trang thai cho duyet', voucher });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const disableVoucher = async (req, res) => {
    try {
        const voucher = await partnerService.disableVoucher(req.user.id, req.params.id);
        res.json({ message: 'Da tam ngung voucher', voucher });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const checkVoucherCode = async (req, res) => {
    try {
        res.json(await partnerService.checkVoucherCode(req.user.id, req.params.code));
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const redeemVoucher = async (req, res) => {
    try {
        const voucher = await partnerService.redeemVoucher(req.user.id, req.body.code, req.body.branchId);
        res.json({ message: 'Xac nhan su dung voucher thanh cong', voucher });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getBranches,
    getDashboard,
    getReport,
    getVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    submitVoucher,
    disableVoucher,
    checkVoucherCode,
    redeemVoucher
};
