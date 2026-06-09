const express = require('express');
const router = express.Router();
const adminController = require('../admin/adminController');

router.get('/public', adminController.getPublicContentItems);
router.get('/public/:slug', adminController.getPublicContentBySlug);

module.exports = router;
