const express = require('express');
const router = express.Router();
const { getVouchers, getVoucherById, searchVouchers, getCategories, getPartnersList } = require('./voucherController');

router.get('/', getVouchers);
router.get('/categories', getCategories);
router.get('/partners', getPartnersList);
router.get('/search', searchVouchers);
router.get('/:id', getVoucherById);

module.exports = router;
