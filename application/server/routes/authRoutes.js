const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, checkAvailability, forgotPassword, resetPassword, verifyOtp } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/check-availability', checkAvailability);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password/:token', resetPassword);


router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);

module.exports = router;
