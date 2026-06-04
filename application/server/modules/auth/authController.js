const authService = require('./authService');

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: 'Registration successful', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body.username, req.body.password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const result = await authService.refreshToken(req.body.refreshToken);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: err.message || 'Invalid refresh token' });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await authService.getProfile(req.user.id, req.user.role);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        await authService.updateProfile(req.user.id, req.user.role, req.body);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.params.token, req.body.password);
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;
        const tempToken = await authService.verifyOtp(email || phone, otp);
        res.json({ message: 'OTP verified successfully', tempToken });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const sendVerificationOtp = async (req, res) => {
    try {
        const result = await authService.sendVerificationOtp(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const checkAvailability = async (req, res) => {
    try {
        const result = await authService.checkAvailability(req.body || {});
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    checkAvailability,
    forgotPassword,
    resetPassword,
    verifyOtp,
    sendVerificationOtp,
};
