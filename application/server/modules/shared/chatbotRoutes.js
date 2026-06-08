// application/server/modules/shared/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const { handleChat } = require('./chatbotController');

// Tuyến đường POST /api/chatbot nhận yêu cầu từ cả Customer và Partner
router.post('/', handleChat);

module.exports = router;
