const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const {
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
} = require('./partnerController');

const partnerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Partner') {
        next();
    } else {
        res.status(403).json({ message: 'Yeu cau quyen Doi tac' });
    }
};

router.use(auth, partnerOnly);

router.get('/dashboard', getDashboard);
router.get('/reports', getReport);
router.get('/branches', getBranches);

router.get('/vouchers', getVouchers);
router.post('/vouchers', createVoucher);
router.get('/vouchers/:id', getVoucherById);
router.put('/vouchers/:id', updateVoucher);
router.post('/vouchers/:id/submit', submitVoucher);
router.post('/vouchers/:id/disable', disableVoucher);

router.get('/voucher-codes/:code', checkVoucherCode);
router.post('/voucher-codes/redeem', redeemVoucher);

module.exports = router;
