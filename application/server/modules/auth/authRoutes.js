const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getProfile, updateProfile, changePassword, checkAvailability, forgotPassword, resetPassword, verifyOtp, sendVerificationOtp } = require('./authController');
const auth = require('../../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/check-availability', checkAvailability);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password/:token', resetPassword);
router.post('/send-verification-otp', sendVerificationOtp);


router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);

module.exports = router;
