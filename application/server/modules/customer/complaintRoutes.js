const express = require('express');
const router = express.Router();
const complaintController = require('./complaintController');
const auth = require('../../middleware/authMiddleware');

router.post('/', auth, complaintController.createComplaint);
router.get('/my', auth, complaintController.getMyComplaints);
router.get('/orders/:orderId', auth, complaintController.getOrderComplaints);
router.get('/:id', auth, complaintController.getComplaintDetail);

module.exports = router;
